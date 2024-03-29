import React, { FC, PropsWithChildren, ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { MdOutlineClose } from 'react-icons/md';

import { Icon, Track } from '../../components';
import './Dialog.scss';

type DialogProps = {
  title: string;
  footer?: ReactNode;
  onClose: () => void;
}

const Dialog: FC<PropsWithChildren<DialogProps>> = ({ title, footer, onClose, children }) => {
  return (
    <RadixDialog.Root defaultOpen={true} onOpenChange={onClose}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className='dialog__overlay' />
        <RadixDialog.Content className='dialog'>
          <div className='dialog__header'>
            <RadixDialog.Title className='h3 dialog__title'>{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button className='dialog__close'>
                <Icon icon={<MdOutlineClose />} size='medium' />
              </button>
            </RadixDialog.Close>
          </div>
          <div className='dialog__body'>
            {children}
          </div>
          {footer && (
            <Track className='dialog__footer' gap={16} justify="end">{footer}</Track>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

export default Dialog;
