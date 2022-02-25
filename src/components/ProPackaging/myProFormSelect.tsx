/*
 * @Author: your name
 * @Date: 2021-10-15 20:56:43
 * @LastEditTime: 2022-02-22 15:23:24
 * @LastEditors: Mao 
 * @Description: In User Settings Edit
 * @FilePath: /archives-web/src/components/myComponents/myButton.tsx
 */
import { ProFormSelect } from '@ant-design/pro-form';
import type { ProFormSelectProps } from '@ant-design/pro-form/lib/components/Select';
import type { FieldProps } from '@ant-design/pro-form/lib/interface';
import type { SelectProps } from 'antd';
import { forIn } from 'lodash';
import { useRef } from 'react';

interface IProps {
  isShow?: boolean;
  // option 显示的格式
  optionFormat?: string;
  // form属性
  formProps?: ProFormSelectProps;
  // 类名
  className?: string;
  disabled?: boolean;
  // 下拉属性
  fieldProps?:
  | (FieldProps &
    SelectProps<any> & {
      searchOnFocus?: boolean | undefined;
      resetAfterSelect?: boolean | undefined;
      optionItemRender?: ((item: any) => React.ReactNode) | undefined;
    })
  | undefined;
}
const MyProFormSelect: React.FC<IProps> = (props) => {
  const searchVal = useRef('');
  // 下拉框过滤 从children value label 属性中 进行筛选
  const filterSelect = (inpput: any, option: any): boolean => {
    const inputValue = inpput.trim().toLowerCase();
    let result = false;
    forIn(option, (_, key) => {
      if (['children', 'value', 'label'].includes(key)) {
        const flag = String(option[key]).toLowerCase()?.includes(inputValue);
        if (flag) {
          result = true;
        }
      }
    });
    return result;
  };

  const createEl = () => {
    if (props.isShow === false) {
      return null;
    }
    // optionFormat option显示的格式 例如 value-label
    const { className, formProps, fieldProps, optionFormat } = props;
    const obj = {};
    Object.assign(obj, {
      ...formProps,
      fieldProps: {
        disabled: props.disabled,
        showSearch: true,
        filterOption: filterSelect,
        // 如果自定义onSearch optionItemRender 搜索关键字变色失效
        onSearch: (value: string) => {
          searchVal.current = value;
        },
        optionFilterProp: 'children',
        // 下拉框自带搜索关键字变色，如果不需要其他格式(optionFormat 不传 传可参考 optionFormat="value(label)")   optionItemRender 传undefined 即可
        optionItemRender: (item: { value: any; label: any }) => {
          // option的展示格式
          const format =
            optionFormat?.replaceAll('value', item.value).replaceAll('label', item.label) ||
            item.label;
          // 搜索关键字为红色
          const htmlStr = format.replaceAll(
            searchVal.current,
            `<span style="color:red">${searchVal.current}</span>`,
          );
          return searchVal.current ? <div dangerouslySetInnerHTML={{ __html: htmlStr }} /> : format;
        },
        // 规范样式  fieldProps中传了className 当前样式会失效
        className: `${className || ''}`,
        ...fieldProps,
      },
    });
    const el = <ProFormSelect {...obj} />;
    return el;
  };
  return createEl();
};

export default MyProFormSelect;
