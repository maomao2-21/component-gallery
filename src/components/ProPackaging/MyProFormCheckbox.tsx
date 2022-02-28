/*
 * @Author: your name
 * @Date: 2021-10-28 18:01:14
 * @LastEditTime: 2021-11-18 14:07:53
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /archives-web/src/pages/reportManagement/test/myProFormText.tsx
 */
import { ProFormCheckbox } from '@ant-design/pro-form';
import type {
  ProFormCheckboxGroupProps,
  ProFormCheckboxProps,
} from '@ant-design/pro-form/lib/components/Checkbox';
import type { FieldProps } from '@ant-design/pro-form/lib/interface';
import type { CheckboxGroupProps, CheckboxProps } from 'antd/lib/checkbox';
interface IProps {
  fieldProps?: FieldProps & CheckboxProps;
  formProps?: ProFormCheckboxProps;
  className?: string;
  children: any;
}
interface IPropsGroup {
  fieldProps?: FieldProps & CheckboxGroupProps;
  formProps?: ProFormCheckboxGroupProps;
  className?: string;
}

const MyProFormCheckbox = (props: IProps) => {
  const { formProps, fieldProps, className } = props;
  const obj = {
    fieldProps: {
      className: `${className}`,
      ...fieldProps,
    },
    ...formProps,
  };
  return <ProFormCheckbox {...obj}>{props.children}</ProFormCheckbox>;
};

MyProFormCheckbox.Group = (IPropsGroup: IPropsGroup) => {
  const { formProps, fieldProps, className } = IPropsGroup;
  const obj = {
    fieldProps: {
      className: `${className}`,
      ...fieldProps,
    },
    ...formProps,
  };
  return <ProFormCheckbox.Group {...obj} />;
};

export default MyProFormCheckbox;
