/*
 * @Descripttion:
 * @version: 1.0
 * @Author:
 * @Date: 2021-11-30 17:27:43
 * @LastEditors: Mao 
 * @LastEditTime: 2022-02-28 13:46:56
 * @FilePath: /xh标准版/archives-web/src/components/myComponents/myAudioPlayer.tsx
 * Copyright 2021 YingJie Xing, All Rights Reserved.
 */
import React from 'react';
import ReactAudioPlayer from 'react-audio-player';
interface IProps {
  // 音频来源src 必传
  src: string;
  // id
  id?: string;
  // 是否自动播放
  autoPlay?: boolean;
  // 是否可控
  controls?: boolean;
  // 样式
  style?: object;
}
const MyAudioPlayer: React.FC<IProps> = (props) => {
  const { id, src, autoPlay, controls, style } = props;
  return (
    <ReactAudioPlayer
      id={id || ''}
      style={style || { width: '800px', height: '100px' }}
      src={src}
      autoPlay={autoPlay || false}
      controls={controls || true}
    />
  );
};
export default MyAudioPlayer;
