/*
 * @Description:
 * @Version: 2.0
 * @Autor: Mao
 * @Date: 2022-02-28 13:18:13
 * @LastEditors: Mao
 * @LastEditTime: 2022-02-28 17:20:09
 */

import React, { useState } from 'react';
import MyVideoPlayer from '@/components/ProPackaging/MyVideoPlayer';
import MyAudioPlayer from '@/components/ProPackaging/MyAudioPlayer';
import { MyOffice } from '@/components/ProPackaging';

import { Row, Col, Card } from 'antd';
import './index.less';
import ceshi from './ceshi.docx';
function demo() {

  return (
    <div>
      <Card >
        <h1>AudioPlayer 支持音频类型文件</h1>
        <MyAudioPlayer src='http://downsc.chinaz.net/files/download/sound1/201206/1638.mp3' />
      </Card>
      <Card >
        <h1>VideoPlayer 支持视频类型文件</h1>
        <MyVideoPlayer id="1" sources='http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4' />
      </Card>
      <Card >
        <h1>VideoPlayer 支持视频类型文件</h1>
        <MyOffice fileType='html' key='2' filePath={ceshi} />
      </Card>
    </div>
  );
}

export default demo;
