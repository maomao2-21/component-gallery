/*
 * @Description:
 * @Version: 2.0
 * @Autor: Mao
 * @Date: 2022-02-28 13:18:13
 * @LastEditors: Mao
 * @LastEditTime: 2022-03-02 17:33:29
 */

import React, { useEffect, useState } from 'react';
import MyVideoPlayer from '@/components/ProPackaging/MyVideoPlayer';
import MyAudioPlayer from '@/components/ProPackaging/MyAudioPlayer';
import { MyOffice } from '@/components/ProPackaging';
import { Row, Col, Card } from 'antd';
import style from './index.css';
import ceshi from './ceshi.docx';
import PDFurl from './pdfdemo.pdf';
import $ from 'jquery';
const demo = () => {
  useEffect(() => {
    console.log(1);
  }, []);
  return (
    <div>
      <Card>
        <ul className={style.skill}>
          <li>
            <dl>
              <dt />
              <dd>90%</dd>
            </dl>
            <div>PHOTOSHOP</div>
            <div className={style.sm}>PS</div>
          </li>
          <li>
            <dl>
              <dt />
              <dd>80%</dd>
            </dl>
            <div>ILLUSTRATOR</div>
            <div className={style.sm}>AI</div>
          </li>
          <li>
            <dl>
              <dt />
              <dd>50%</dd>
            </dl>
            <div>CINEMA 4D</div>
            <div className={style.sm}>C4D</div>
          </li>
          <li>
            <dl>
              <dt />
              <dd>90%</dd>
            </dl>
            <div>HTML</div>
            <div className={style.sm}>HTML</div>
          </li>
          <li>
            <dl>
              <dt />
              <dd>90%</dd>
            </dl>
            <div>CSS</div>
            <div className={style.sm}>CSS</div>
          </li>
          <li>
            <dl>
              <dt />
              <dd>80%</dd>
            </dl>
            <div>JAVASCRIPT</div>
            <div className={style.sm}>JS</div>
          </li>
        </ul>
      </Card>
      <Card className={style.skill}>
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
            '/pdfjs/web/viewer.html?file=http://' + location.host + PDFurl
          }
          width="85%"
          height="700px"
        />
      </Card>
    </div>
  );
};

export default demo;
