/*
 * @Author: your name
 * @Date: 2021-11-16 18:52:39
 * @LastEditTime: 2021-11-17 16:57:07
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /archives-web/src/components/myComponents/MyDatePicker.tsx
 */
import {
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDateTimeRangePicker,
  ProFormTimePicker,
} from '@ant-design/pro-form';
import type { FieldProps, ProFormFieldItemProps } from '@ant-design/pro-form/lib/interface';
import type {
  DatePickerProps,
  MonthPickerProps,
  RangePickerProps,
  WeekPickerProps,
} from 'antd/lib/date-picker';

type Data = {
  type?:
    | 'date' // 日期
    | 'dateRange' // 日期区间
    | 'datetime' // 日期时间
    | 'dateTimeRange' // 日期时间区间
    | 'yearRange' // 年区间
    | 'dateYear' // 年
    | 'dateQuarter' // 季度
    | 'dateMonth' // 月
    | 'monthRange' // 月区间
    | 'dateWeek' // 周
    | 'time' // 时间
    | 'timeRange'; // 时间区间
  fieldProps?: FieldProps &
    (DatePickerProps | WeekPickerProps | MonthPickerProps | RangePickerProps);
};
type IProps = {
  formProps?: ProFormFieldItemProps<DatePickerProps>;
  className?: string;
} & Data;

const MyProFormDatePicker: React.FC<IProps> = (props) => {
  const createEl = () => {
    const { formProps, fieldProps, className } = props;
    const obj = {
      name: props.type || 'date',
      className: `${className}`,
      ...formProps,
      fieldProps: {
        ...fieldProps,
      },
    };
    if (props.type === 'yearRange') {
      Object.assign(obj.fieldProps, {
        picker: 'year',
        format: 'YYYY',
      });
    }
    if (props.type === 'monthRange') {
      Object.assign(obj.fieldProps, {
        picker: 'month',
        format: 'YYYY-MM',
      });
    }
    switch (props.type) {
      case 'date':
        return <ProFormDatePicker {...obj} />;
      case 'dateYear':
        return <ProFormDatePicker.Year {...obj} />;
      case 'dateQuarter':
        return <ProFormDatePicker.Quarter {...obj} />;
      case 'dateMonth':
        return <ProFormDatePicker.Month {...obj} />;
      case 'dateWeek':
        return <ProFormDatePicker.Week {...obj} />;
      case 'time':
        return <ProFormTimePicker {...obj} />;
      case 'datetime':
        return <ProFormDateTimePicker {...obj} />;
      case 'dateTimeRange':
        return <ProFormDateTimeRangePicker {...obj} />;
      case 'dateRange':
        return <ProFormDateRangePicker {...obj} />;
      case 'timeRange':
        return <ProFormTimePicker.RangePicker {...obj} />;
      case 'yearRange':
        return <ProFormDateRangePicker {...obj} />;
      case 'monthRange':
        return <ProFormDateRangePicker {...obj} />;
      default:
        return <ProFormDatePicker {...obj} />;
    }
  };

  return createEl();
};

export default MyProFormDatePicker;
