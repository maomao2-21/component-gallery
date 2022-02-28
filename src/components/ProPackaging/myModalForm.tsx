/*
 * @Description:
 * @Version: 2.0
 * @Autor: Mao
 * @Date: 2022-02-28 11:09:12
 * @LastEditors: Mao
 * @LastEditTime: 2022-02-28 15:26:59
 */
import type { ModalFormProps, ProFormInstance } from '@ant-design/pro-form';
import { ModalForm } from '@ant-design/pro-form';
import { useRef } from 'react';
// import { MyButton, OptionButton } from '.';
import type { IMyBtnProps } from './myButton';

// fileProps 为自定义属性
type IProps = ModalFormProps & {
  resetBtn?: IMyBtnProps;
  submitBtn?: IMyBtnProps;
  fileProps: ModalFormProps;
};
const MyModalForm = (props: IProps) => {
  const formRef = useRef<ProFormInstance>();
  return (
    <ModalForm
      formRef={formRef}
      submitter={{
        render: (btnProps, defaultDoms) => {
          return [
            <OptionButton key="option">
              <MyButton
                text="取消"
                fileProps={{
                  onClick: defaultDoms[0].props.onClick
                }}
                {...props?.resetBtn}
              />
              <MyButton
                text="确定"
                fileProps={{
                  type: 'primary',
                  onClick: defaultDoms[1].props.onClick
                }}
                {...props?.submitBtn}
              />
            </OptionButton>
          ];
        }
      }}
      {...props.fileProps}
    >
      {props.children}
    </ModalForm>
  );
};

export default MyModalForm;
