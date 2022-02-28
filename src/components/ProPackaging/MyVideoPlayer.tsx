/*
 * @Descripttion:
 * @version: 1.0
 * @Author:
 * @Date: 2021-11-30 14:13:31
 * @LastEditors: Mao
 * @LastEditTime: 2022-02-28 15:07:08
 * @FilePath: /xh标准版/archives-web/src/components/myComponents/MyVideoPlayer.tsx
 * Copyright 2021 YingJie Xing, All Rights Reserved.
 */

import React, { CSSProperties, Fragment } from 'react';
import Player from 'griffith';
interface IProps {
  // id
  id: string;
  // 音频来源
  sources: string;
  // sources={{
  //     hd: {
  //         play_url: string,
  //     },
  // }}
  // 是否自动播放
  autoplay?: boolean | undefined;
  className?: React.CSSProperties | undefined;
}
const MyVideoPlayer: React.FC<IProps> = (props) => {
  const { id, sources, autoplay, className } = props;
  return (
    //宽高应该是以一个比例来实现 占屏面积
    <div style={className || { width: '400px', height: '400px', padding: '1em' }}>
      <Player
        id={id}
        autoplay={autoplay}
        sources={{
          hd: {
            play_url: sources
          }
        }}
      />
    </div>

  );
};
export default MyVideoPlayer;
