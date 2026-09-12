package com.dada_labs_two.chamavault.chama.activities;

import com.dada_labs_two.chamavault.chama.constants.*;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.chama.repositories.ChamaMemberRepository;
import com.dada_labs_two.chamavault.users.models.User;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.ZonedDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class ChamaActivityService {
 private final ChamaActivityRepository repository;
 private final ChamaMemberRepository memberRepository;

 public ChamaActivity record(com.dada_labs_two.chamavault.chama.models.Chama chama, User actor,
   ChamaActivityType type, ActivityCategory category, String title, String description, String subjectType,
   String subjectReference, Long amountSats, UUID walletReference, UUID transactionReference,
   UUID governanceReference, String eventKey, Map<String,String> metadata) {
  return record(new RecordChamaActivity(chama,actor,type,category,ActivityStatus.SUCCESSFUL,
   ActivityVisibility.ALL_MEMBERS,title,description,subjectType,subjectReference,amountSats,walletReference,
   transactionReference,governanceReference,eventKey,metadata,ZonedDateTime.now()));
 }

 @Transactional
 public ChamaActivity record(RecordChamaActivity in) {
  if (in.eventKey()!=null && !in.eventKey().isBlank()) {
   Optional<ChamaActivity> existing=repository.findByEventKey(in.eventKey());
   if(existing.isPresent()) return existing.get();
  }
  return repository.save(ChamaActivity.builder().chama(in.chama()).actor(in.actor()).activityType(in.type())
   .category(in.category()).status(in.status()==null?ActivityStatus.SUCCESSFUL:in.status())
   .visibility(in.visibility()==null?ActivityVisibility.ALL_MEMBERS:in.visibility()).title(in.title())
   .description(in.description()).subjectType(in.subjectType()).subjectReference(in.subjectReference())
   .amountSats(in.amountSats()).walletReference(in.walletReference()).transactionReference(in.transactionReference())
   .governanceRequestReference(in.governanceRequestReference()).eventKey(in.eventKey())
   .metadata(in.metadata()==null?new HashMap<>():new HashMap<>(in.metadata()))
   .occurredAt(in.occurredAt()==null?ZonedDateTime.now():in.occurredAt()).build());
 }

 public Page<ChamaActivityDTO> list(UUID chamaId, User user, ActivityCategory category, ChamaActivityType type,
   UUID actor, ZonedDateTime from, ZonedDateTime to, Pageable page) {
  ChamaMember membership=activeMember(chamaId,user);
  Specification<ChamaActivity> spec=(root,q,cb)->{
   List<Predicate> p=new ArrayList<>();
   var actorJoin=root.join("actor", JoinType.LEFT);
   p.add(cb.equal(root.get("chama").get("chamaReference"),chamaId));
   if(category!=null)p.add(cb.equal(root.get("category"),category));
   if(type!=null)p.add(cb.equal(root.get("activityType"),type));
   if(actor!=null)p.add(cb.equal(actorJoin.get("userReference"),actor));
   if(from!=null)p.add(cb.greaterThanOrEqualTo(root.get("occurredAt"),from));
   if(to!=null)p.add(cb.lessThanOrEqualTo(root.get("occurredAt"),to));
   if(membership.getRole()!=ChamaRole.ADMIN) p.add(cb.or(root.get("visibility").in(ActivityVisibility.ALL_MEMBERS),
     cb.and(cb.equal(root.get("visibility"),ActivityVisibility.ACTOR_AND_ADMINS),
       cb.equal(actorJoin.get("userReference"),user.getUserReference()))));
   else p.add(root.get("visibility").in(ActivityVisibility.ALL_MEMBERS,ActivityVisibility.ADMINS_ONLY,ActivityVisibility.ACTOR_AND_ADMINS));
   return cb.and(p.toArray(Predicate[]::new));
  };
  return repository.findAll(spec,page).map(this::dto);
 }

 public ChamaActivityDTO get(UUID chamaId,UUID activityId,User user){
  ChamaMember membership=activeMember(chamaId,user);
  ChamaActivity a=repository.findById(activityId).orElseThrow(()->new IllegalArgumentException("Chama activity not found"));
  if(!a.getChama().getChamaReference().equals(chamaId))throw new IllegalArgumentException("Activity does not belong to chama");
  if(a.getVisibility()==ActivityVisibility.SYSTEM_ONLY ||
    (a.getVisibility()==ActivityVisibility.ADMINS_ONLY && membership.getRole()!=ChamaRole.ADMIN) ||
    (a.getVisibility()==ActivityVisibility.ACTOR_AND_ADMINS && membership.getRole()!=ChamaRole.ADMIN &&
      (a.getActor()==null||!a.getActor().getUserReference().equals(user.getUserReference()))))
   throw new SecurityException("Activity is not visible to this member");
  return dto(a);
 }
 private ChamaMember activeMember(UUID chamaId,User user){
  if(user==null)throw new SecurityException("Authentication required");
  return memberRepository.findByChama_ChamaReferenceAndUser_UserReferenceAndStatus(chamaId,user.getUserReference(),MembershipStatus.ACTIVE)
   .orElseThrow(()->new SecurityException("Only active chama members may view activities"));
 }
 private ChamaActivityDTO dto(ChamaActivity a){ return new ChamaActivityDTO(a.getReference(),a.getChama().getChamaReference(),
  a.getActivityType(),a.getCategory(),a.getStatus(),a.getVisibility(),a.getActor()==null?null:a.getActor().getUserReference(),
  a.getActor()==null?null:a.getActor().getUsername(),a.getTitle(),a.getDescription(),a.getSubjectType(),a.getSubjectReference(),
  a.getAmountSats(),a.getWalletReference(),a.getTransactionReference(),a.getGovernanceRequestReference(),a.getMetadata(),a.getOccurredAt()); }
}
