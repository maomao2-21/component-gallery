/*
 * @Descripttion:
 * @version: 1.0
 * @Author:
 * @Date: 2021-11-30 17:08:48
 * @LastEditors: YingJie Xing
 * @LastEditTime: 2021-11-30 17:14:21
 * @FilePath: /xh标准版/archives-web/src/components/myComponents/MyOffice.tsx
 * Copyright 2021 YingJie Xing, All Rights Reserved.
 */
import React from 'react';
// import FileViewer from 'react-file-viewer';
import { useRef, useEffect, useState } from 'react';

interface IProps {
  // 文件类型
  fileType: string;
  // 文件地址src
  filePath: string;
}
const MyOffice: React.FC<IProps> = (props) => {
  const { fileType, filePath } = props;
  const ComP = useRef();
  const [, render] = useState(1);
  useEffect(() => {
    import(/* webpackChunkName: "FileViewer" */ 'react-file-viewer').then((module) => {
      ComP.current = module.default;
      render(Math.random());
    });
  }, []);

  if (ComP.current) {
    return (
      <ComP.current
        fileType={fileType}
        filePath={filePath}
        // onError={onError}
        errorComponent={Error}
        unsupportedComponent={Error}
      ></ComP.current>
    );
  }

  return null;

};
export default MyOffice;
