import 'client-only';
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FunctionComponent,
  PropsWithChildren,
  forwardRef,
  useMemo,
} from 'react';
import classNames from 'classnames';
import styles from './styles.module.css';

export interface ButtonProps
  extends Omit<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    'ref'
  > {
  // @default {false}
  secondary?: boolean;
}

export const Button: FunctionComponent<PropsWithChildren<ButtonProps>> =
  forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(function Button(
    { children, secondary = false, onClick: onClickProp, disabled, ...rest },
    ref,
  ) {
    const className = useMemo(() => {
      const variant = !secondary ? 'primary' : 'secondary';

      return classNames(styles.container, [styles[variant]]);
    }, [secondary]);

    const onClick = disabled ? undefined : onClickProp;

    return (
      <button
        ref={ref}
        className={className}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    );
  });
