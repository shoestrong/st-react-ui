import React, { FC, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { IGlobal } from '../../local';
import LocalConsumer from '../ConfigProvider/LocalConsumer';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import Mask from '../Mask';
import Button from '../Button';
import Drag, { DragProps } from '../Drag';
import './index.less';
import { toggleBodyOverflow } from '../../utils/dom';
import { varStyle } from '../../utils';

export interface ModalProps {
  visible: boolean;
  top?: number;
  width?: number;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  destroyOnClose?: boolean;
  title?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  footer?: React.ReactNode;
  footerAlign?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
  onOk?: () => void;
  onClose?: () => void;
  layoutDom?: HTMLElement;
  isMove?: boolean;
}

const cssPrefix: string = 'st-modal';
let dragBox: DragProps | null = null;
const Modal: FC<ModalProps> = ({
  visible,
  className,
  style,
  zIndex = varStyle.modalZIndex,
  width = 600,
  top = 50,
  title,
  destroyOnClose = true,
  children,
  footer,
  okText,
  cancelText,
  footerAlign = 'right',
  loading,
  layoutDom = document.body,
  onOk,
  onClose,
  isMove = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const setWrapperTopLeft = (top: number, left: number): void => {
    const dom = wrapperRef.current;
    if (dom) {
      dom.style.top = top + 'px';
      dom.style.left = left + 'px';
    }
  };

  const setDefaultLeftTop = (): void => {
    let clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
    setWrapperTopLeft(top, (clientWidth - width) / 2);
  };

  const initDrag = () => {
    if (!isMove) {
      return;
    }
    if (titleRef.current && wrapperRef.current) {
      dragBox = new Drag(titleRef.current, wrapperRef.current, false);
      dragBox.init();
    }
  };

  const removeDrag = () => {
    if (!isMove || !dragBox) {
      return;
    }
    dragBox.remove();
    dragBox = null;
  };

  useEffect(() => {
    toggleBodyOverflow(visible);
    if (visible) {
      setDefaultLeftTop();
      window.onresize = () => setDefaultLeftTop();
      initDrag();
    } else {
      removeDrag();
    }
    return () => {
      window.onresize = null;
      removeDrag();
    };
  }, [visible]);

  return ReactDOM.createPortal(
    <LocalConsumer>
      {(local: IGlobal) => {
        return (
          <>
            {visible && <Mask style={{ zIndex }} />}
            <div
              className={classNames(cssPrefix)}
              style={{ display: visible ? 'block' : 'none', zIndex }}
            >
              {destroyOnClose && !visible ? null : (
                <CSSTransition timeout={400} in={visible} classNames="z-modal" appear>
                  <div
                    ref={wrapperRef}
                    className={classNames(`${cssPrefix}-info`, className)}
                    style={{ ...style, width: `${width}px` }}
                  >
                    <div
                      ref={titleRef}
                      className={`${cssPrefix}-title`}
                      style={{ cursor: isMove ? 'move' : 'auto' }}
                    >
                      <div className={`${cssPrefix}-title-info`}>
                        {title !== undefined ? title : local.title}
                      </div>
                      <div
                        className={`${cssPrefix}-title-close`}
                        onClick={() => !loading && onClose && onClose()}
                      >
                        ×
                      </div>
                    </div>
                    <div className={`${cssPrefix}-body`}>{children}</div>
                    {footer ? (
                      footer
                    ) : (
                      <div className={`${cssPrefix}-footer`} style={{ textAlign: footerAlign }}>
                        <Button type="default" onClick={() => !loading && onClose && onClose()}>
                          {cancelText || local.cancel}
                        </Button>
                        <Button onClick={() => !loading && onOk && onOk()} loading={loading}>
                          {okText || local.ok}
                        </Button>
                      </div>
                    )}
                  </div>
                </CSSTransition>
              )}
            </div>
          </>
        );
      }}
    </LocalConsumer>,
    layoutDom,
  );
};

export default Modal;
