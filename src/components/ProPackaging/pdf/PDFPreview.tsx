import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { Empty } from 'antd';

interface Props {
  url: string;
  style?: React.CSSProperties;
  config?: Config;
}

type Config = {
  colour?: boolean;
  watermark?: string; // 水印文字
};

export default function PDFIndex(props: Props): ReactElement {
  const propsRef = useRef<Props>({ url: '', config: { colour: false } });
  const iframeRef = useRef();

  // const [randomKey, setRandomKey] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 发送消息
  const sendMessage = () => {
    const config = {
      colour: false,
      ...(props.config || {}),
      blobUrl: props.url,
      watermark: '',
    };
    iframeRef.current!.contentWindow.postMessage(JSON.stringify({ type: 'config', config }), '*');
  };

  const iframeLoad = () => {
    sendMessage();
  };

  useEffect(() => {
    // 地址变化了
    // console.log('boburl变化了', propsRef.current.url,'aaa', propsRef.current.url, 'bb',props.url);
    if (propsRef.current.url !== props.url) {
      sendMessage();
    }
    propsRef.current = props;
  }, [props.url]);

  useEffect(() => {
    const messageChange = (e) => {
      // console.log('收到子iframe传过来的数据', data);
      try {
        console.log('收到子窗口的消息', e.data);
        const data = JSON.parse(e.data);
        if (data.type === 'watermark') {
          if (data.data.showWatermark) {
            console.log('显示水印');
          } else {
            console.log('隐藏水印');
          }
        }
        if (data.type === 'componentDidMount') {
          console.log(props, 12312312);
          // sendMessage();//此处代码会引起首次打开默认加载第一个pdf时打印功能报错
        }
      } catch (error) {
        console.error(error);
      }
    };
    window.addEventListener('message', messageChange, false);
    setIsLoading(false);

    return () => {
      window.removeEventListener('message', messageChange, false);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', ...(props.style || {}) }}>
      <div
        style={{
          display: isLoading ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <Empty description="加载中..." />
      </div>
      <iframe
        // key={randomKey}
        onLoad={iframeLoad}
        ref={iframeRef}
        src={`http://${window.location.host}/pdf-preview`}
        // src={`http://${window.location.host}/pdf-preview?config=${JSON.stringify(config)}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: !isLoading ? 'block' : 'none',
        }}
      />
    </div>
  );
}
