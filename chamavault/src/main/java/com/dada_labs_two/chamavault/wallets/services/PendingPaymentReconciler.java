package com.dada_labs_two.chamavault.wallets.services;

import com.dada_labs_two.chamavault.chama.activities.*;
import com.dada_labs_two.chamavault.fees.dtos.FeeQuote;
import com.dada_labs_two.chamavault.fees.services.FeeService;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.*;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.payments.constants.TransactionStatus;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import com.dada_labs_two.chamavault.users.services.ProfileActionService;
import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;
import com.dada_labs_two.chamavault.wallets.models.*;
import com.dada_labs_two.chamavault.wallets.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j
public class PendingPaymentReconciler {
 private final TransactionRepository transactionRepository;
 private final WalletRepository walletRepository;
 private final LightningWalletService lightningWalletService;
 private final FeeService feeService;
 private final UserRepository userRepository;
 private final ProfileActionService notifications;
 private final ChamaActivityService activities;
 private final OmnibusLedgerService omnibusLedgerService;

 @Scheduled(fixedDelayString="${payments.reconciliation.delay-ms:15000}")
 @Transactional
 public void reconcile(){
  for(Transaction tx:transactionRepository.findTop100ByStatusOrderByOccurredAtAsc(TransactionStatus.PENDING)){
   try{ reconcile(tx); }
   catch(Exception e){ log.warn("Pending payment {} reconciliation deferred: {}",tx.getTransactionReference(),e.getMessage()); }
  }
 }

 void reconcile(Transaction tx){
  Wallet wallet=tx.getWallet();
  String adminKey=wallet.getLightning()==null?null:wallet.getLightning().get("adminkey");
  if(adminKey==null) throw new IllegalStateException("Payer wallet has no Lightning admin key");
  String lookup=tx.getCheckingId()==null||tx.getCheckingId().isBlank()?tx.getExternalRef():tx.getCheckingId();
  PaymentStatus payment=lightningWalletService.checkInvoicePaymentStatus(adminKey,lookup);
  tx.setLastStatusCheckAt(ZonedDateTime.now());
  tx.setStatusCheckCount(Optional.ofNullable(tx.getStatusCheckCount()).orElse(0)+1);
  String status=payment==null||payment.status()==null?"":payment.status().toLowerCase(Locale.ROOT);
  if(payment!=null&&Boolean.TRUE.equals(payment.paid())){
   settle(tx,wallet,adminKey,lookup);
  }else if(Set.of("failed","failure","error","expired").contains(status)){
   tx.setStatus(TransactionStatus.FAILED); tx.setFailedAt(ZonedDateTime.now());
   tx.setFailureReason("Lightning provider payment status: "+status);
   transactionRepository.save(tx);
   if(omnibusLedgerService.isOmnibus(wallet)) omnibusLedgerService.refresh(wallet);
  }else transactionRepository.save(tx);
 }

 private void settle(Transaction tx,Wallet wallet,String adminKey,String lookup){
  PaymentFees networkFee=lightningWalletService.getPaymentFee(adminKey,lookup);
  FeeQuote quoted=new FeeQuote(tx.getCategory(),tx.getAmountSats(),Optional.ofNullable(tx.getPlatformFeeSats()).orElse(0L),
   Math.addExact(tx.getAmountSats(),Optional.ofNullable(tx.getPlatformFeeSats()).orElse(0L)),BigDecimal.ZERO,tx.getFeeRuleReference());
  String feePaymentHash=feeService.collect(wallet,quoted);
  tx.setNetworkFeeSats(networkFee.feeSats());
  tx.setFeeSats(Math.addExact(networkFee.feeSats(),Optional.ofNullable(tx.getPlatformFeeSats()).orElse(0L)));
  tx.setStatus(TransactionStatus.COMPLETED); tx.setSettledAt(ZonedDateTime.now());
  Map<String,String> metadata=tx.getMetadata()==null?new HashMap<>():new HashMap<>(tx.getMetadata());
  metadata.put("paymentState","SETTLED"); metadata.put("networkFeeSats",String.valueOf(networkFee.feeSats()));
  if(feePaymentHash!=null)metadata.put("feePaymentHash",feePaymentHash);
  tx.setMetadata(metadata); transactionRepository.save(tx);
  if(omnibusLedgerService.isOmnibus(wallet)){
   omnibusLedgerService.refresh(wallet);
  }else{
   WalletDetails balance=lightningWalletService.getUserWallet(wallet.getLightning().get("inkey"));
   wallet.setLnBitsbalanceSats(balance.balance()); wallet.setBalanceSats(balance.balance()/1000); walletRepository.save(wallet);
  }
  if(tx.getCategory()==TransactionCategory.WITHDRAWAL&&metadata.get("recipientMsisdn")!=null){
   User payer=userRepository.findById(wallet.getOwnerReference()).orElse(null);
   if(payer!=null)notifications.notifyOffRampPayment(payer,metadata.get("recipientMsisdn"),tx.getAmountSats(),tx.getExternalRef());
  }
  if(wallet.getChama()!=null)activities.record(wallet.getChama(),userRepository.findById(wallet.getOwnerReference()).orElse(null),
   ChamaActivityType.PAYOUT_REQUESTED,ActivityCategory.PAYOUT,"Off-ramp Lightning payment settled",
   tx.getAmountSats()+" sats was delivered to the off-ramp provider; mobile-money processing may still be pending",
   "TRANSACTION",tx.getTransactionReference().toString(),tx.getAmountSats(),
   wallet.getWalletReference(),tx.getTransactionReference(),null,"PAYOUT_SETTLED:"+tx.getExternalRef(),metadata);
 }
}
