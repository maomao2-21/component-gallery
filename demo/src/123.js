/*
 * @Description: 
 * @Version: 2.0
 * @Autor: Mao 
 * @Date: 2022-02-17 10:26:50
 * @LastEditors: Mao 
 * @LastEditTime: 2022-02-17 11:15:28
 */
import React, { Component } from 'react'

export default class 123 extends Component {
  const handleSearch = (e) => {
    e.preventDefault();
    props.form.validateFields(async (err, values) => {
      if (!err) {
        let start = values?.rangeDate?.[0]?._d ? moment(values.rangeDate[0]._d).format('YYYY-MM-DD') : '';
        let end = values?.rangeDate?.[1]?._d ? moment(values.rangeDate[1]._d).format('YYYY-MM-DD') : '';
        startTimeRef.current = start;
        endTimeRef.current = end;
        stateRef.current = values.state;
        await getTableDate('1');
      }
    });
  };
  render() {
    return (
      <div  >123</div>
    )
  }
}
