/*
 * @Author: your name
 * @Date: 2021-10-15 20:56:43
 * @LastEditTime: 2022-02-28 15:24:07
 * @LastEditors: Mao
 * @Description: In User Settings Edit
 * @FilePath: \archives-web\src\components\myComponents\myButton.tsx
 */

import type { ButtonProps, DropDownProps, FormItemProps, ModalProps, PopconfirmProps } from 'antd';
import { Dropdown } from 'antd';
import { Form } from 'antd';
import { Popconfirm } from 'antd';
import { Button } from 'antd';

import { connect } from 'react-redux';
import { debounce } from 'lodash';
import type { ModalFormProps } from '@ant-design/pro-form';
import { ModalForm } from '@ant-design/pro-form';
// import { BUTTON } from '@/utils/button';   //按钮的名称名 以及权限参数
/***
 * modal 示例
 *
       <MyButton
            text="编研"
            fileProps={{ type: 'link' }}
            modalFormProps={{
              onFinish: async () => {
                return false;
              },
              title: '在线编研',
              modalProps: {
                className: 'fullScreenModalHasFooter',
              },
            }}
            isShow={[BYZT.byz, BYZT.shbtg].includes(record.zt)}
          >
          123
          </MyButton>
 */
export interface IMyBtnProps {
  // 删除按钮是否显示确认框 默认 true
  isShowDelPopconfirm?: boolean;
  // 是否显示   比如某一个状态需要显示或者隐藏(不渲染dom)
  isShow?: boolean;
  // 按钮属性
  fileProps?: ButtonProps;
  // 按钮文本
  text?: any;
  // 权限参数
  btnJurisdiction?: string;
  // 权限数据
  buttonJurisdiction?: string[];
  // 气泡确认框
  popconfirmProps?: PopconfirmProps;
  // 按钮类名  目的是和统一按钮类名叠加 如果fileProps传了className 会覆盖当前类名
  className?: string;
  isRenderFormItem?: boolean;
  formProps?: FormItemProps;
  // ProModal属性
  modalFormProps?: ModalFormProps;
  buttonJurisdictionStatus?: Record<string, boolean>; // 权限控制数据，是否启用改权限
  // 下拉按钮属性  如果文字后面添加图标  需要用双标签
  /**
   * 示例
   * <MyButton
                    dropDownProps={{
                      overlay: dh_menu,
                    }}
                  >
                    档号操作 <DownOutlined />
                  </MyButton>
   */
  dropDownProps?: DropDownProps;
  // 普通弹出框属性
  modalProps?: ModalProps;
  children?: any;
}

const MyButton: React.FC<IMyBtnProps> = (props) => {
  const {
    className,
    buttonJurisdiction,
    btnJurisdiction,
    popconfirmProps,
    text,
    fileProps,
    buttonJurisdictionStatus
  } = props;

  const createEl = () => {
    // 是否展示组件
    if (props.isShow === false) {
      return null;
    }

    if (JSON.parse(localStorage.getItem('currentUser') || '{}')?.username !== 'admin') {
      // 权限控制
      // 如果传了btnJurisdiction属性并且 没有权限 返回null
      // btnJurisdiction={BUTTON.detail.btnJurisdiction}
      //  const  BUTTON = { add: { text: '新增', btnJurisdiction: 'add' },
      //buttonJurisdiction 数组中有没有权限
      if (btnJurisdiction !== undefined && !buttonJurisdiction?.includes(btnJurisdiction || '')) {
        return null;
      }

      // 权限控制
      if (btnJurisdiction !== undefined) {
        // 如果是false说明添加了改权限，但是权限被禁用了
        if (buttonJurisdictionStatus && buttonJurisdictionStatus[btnJurisdiction] === false) {
          return null;
        }
      }
    }

    // 给点击事件添加防抖 1秒内只能操作一次
    if (fileProps?.onClick) {
      Object.assign(fileProps, {
        onClick: debounce(fileProps?.onClick, 1000, {
          leading: true,
          trailing: false
        })
      });
    }

    const deletePopconfirm: PopconfirmProps = {
      title: '确定删除吗'
    };
    // 给配置了删除权限的删除按钮添加确认弹出框
    // popconfirmProps={{
    //   title: '确定要提交吗？',
    //   onConfirm: handleOK,
    // }}
    if (
      props.btnJurisdiction === BUTTON.delete.btnJurisdiction &&
      !popconfirmProps &&
      props.isShowDelPopconfirm !== false
    ) {
      Object.assign(deletePopconfirm, {
        onConfirm: fileProps?.onClick
      });
      delete fileProps?.onClick;
    }

    let el = (
      <Button className={`${className}`} {...fileProps} data-jurisdiction={props.btnJurisdiction}>
        {props.modalFormProps ? text : props.children || text}
      </Button>
    );
    // 如果是下拉按钮
    if (props.dropDownProps) {
      el = <Dropdown {...props.dropDownProps}>{el}</Dropdown>;
    }

    if (popconfirmProps || deletePopconfirm.onConfirm) {
      // 如果是气泡
      el = (
        <Popconfirm okText="确定" cancelText="取消" {...deletePopconfirm} {...popconfirmProps}>
          {el}
        </Popconfirm>
      );
    }
    // 是否展示Modal弹出框
    if (props.modalFormProps) {
      return (
        <ModalForm
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 22 }}
          layout="horizontal"
          modalProps={{
            // destroyOnClose: true,
            ...props.modalProps
          }}
          trigger={el}
          title="新建"
          onFinish={async () => {
            return true;
          }}
          {...props.modalFormProps}
        >
          {props.children}
        </ModalForm>
      );
    }

    return el;
  };
  return (
    <>
      {props.isRenderFormItem ? (
        <Form.Item {...props.formProps}>{createEl()}</Form.Item>
      ) : (
        createEl()
      )}
    </>
  );
};

export default connect(({ user }: any) => ({
  buttonJurisdiction: user?.buttonJurisdiction,
  buttonJurisdictionStatus: user?.buttonJurisdictionStatus
}))(MyButton);

{/* <MyButton
text="读取身份证信息"
isRenderFormItem={true}
formProps={{
  label: '识别信息',
}}
fileProps={{

}}
/> */}
