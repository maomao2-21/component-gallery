/*
 * @Descripttion:
 * @version: 1.0
 * @Author: YingJie Xing
 * @Date: 2022-01-13 10:19:23
 * @LastEditors: YingJie Xing
 * @LastEditTime: 2022-01-13 13:33:41
 * @FilePath: \archives-web\src\components\myComponents\myProFormDigit.tsx
 * Copyright 2022 YingJie Xing, All Rights Reserved.
 */
import { ProFormDigit } from '@ant-design/pro-form';
import type { InputNumberProps } from 'antd';
import type { FieldProps, ProFormFieldItemProps } from '@ant-design/pro-form/lib/interface';
//示例：
/**
          <MyProFormDigit
            className=''//类名
            label={item.name}
            name={item.field}
            placeholder={'请输入' + item.name + '的数量'}
            min={0}
            max={99999}
            fieldProps={{ 
                precision: 0，//小数点位数
                style: { width: '160px' },//样式
                onChange: (value: any) => dealWay()//输入改变时触发
             }}
          />
 */
interface IProps {
  className?: string; // 类名
  disabled?: boolean;
  label?: string;
  name?: string;
  min?: number; //最小值
  max?: number; //最大值
  fieldProps?: (FieldProps & InputNumberProps<string | number>) | undefined;
  placeholder?: string; //提示文字
}
const MyProFormDigit: React.FC<IProps> = (props) => {
  const createEl = () => {
    // const { label, name, placeholder, min, max, disabled, fieldProps } = props;
    const el = (
      <ProFormDigit
        {...props}
        // label={label}
        // name={name}
        // placeholder={placeholder}
        // min={min}
        // max={max}
        // disabled={disabled}
        // fieldProps={{ ...fieldProps }}
      />
    );
    return el;
  };
  return createEl();
};
export default MyProFormDigit;
