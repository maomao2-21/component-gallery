/*
 * @Description:
 * @Version: 2.0
 * @Autor: Mao
 * @Date: 2022-02-28 13:18:13
 * @LastEditors: Mao
 * @LastEditTime: 2022-03-01 17:41:48
 */

import React, { useState } from 'react';
import MyVideoPlayer from '@/components/ProPackaging/MyVideoPlayer';
import MyAudioPlayer from '@/components/ProPackaging/MyAudioPlayer';
import { MyOffice } from '@/components/ProPackaging';
import { Row, Col, Card } from 'antd';
import './index.less';
import ceshi from './ceshi.docx';
import PDFurl from './pdfdemo.pdf';

function demo() {
  return (
    <div>
      <Card >
        <h1>AudioPlayer 支持音频类型文件</h1>
        <MyAudioPlayer src='http://downsc.chinaz.net/files/download/sound1/201206/1638.mp3' />
      </Card>
      <Card >
        <h1>VideoPlayer 支持视频类型文件 可切换清晰度</h1>
        <MyVideoPlayer id="1" sources='http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4' />
      </Card>
      <Card >
        <h1> 支持.doc.docx.pdf 类型</h1>
        <MyOffice fileType='docx' key='2' filePath={ceshi} />
      </Card>
      <Card >
        <h1> .pdf类型</h1>
        <iframe
          style={{ zIndex: '1' }}
          frameBorder="0"
          src={
            '/pdfjs/web/viewer.html?file=http://localhost:8000/e2ed243292f3c6370121f3c48e79485f.pdf'
          }
          width="85%"
          height="700px"
        />
      </Card>
    </div>
  );
}

export default demo;
