import * as React from 'react';
import { View as DefaultView } from 'react-native';
import { cn } from '@/lib/utils';

type ViewProps = React.ComponentPropsWithoutRef<typeof DefaultView>;

const View = React.forwardRef<React.ComponentRef<typeof DefaultView>, ViewProps>(
  ({ className, ...props }, ref) => {
    return <DefaultView className={cn('bg-background', className)} ref={ref} {...props} />;
  },
);
View.displayName = 'View';

export { View };
export type { ViewProps };
