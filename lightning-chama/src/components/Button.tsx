import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button = ({ variant = 'primary', className, ...props }: ButtonProps) => {
  const baseStyles =
    'px-8 py-2 border rounded-2xl text-sm font-bold transition-all';

  const variants = {
    primary:
      'bg-[#059669] text-white border-[#059669] hover:bg-white hover:text-[#059669] hover:border-[#059669]',
    secondary:
      'bg-white text-[#059669] border-[#059669] hover:bg-[#059669] hover:text-white',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
};

export default Button;
