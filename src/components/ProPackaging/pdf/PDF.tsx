import React, { ReactElement, useEffect, useRef, useState } from 'react';
import {
  ArrowUpOutlined,
  MinusOutlined,
  PlusOutlined,
  PrinterOutlined,
  DownloadOutlined,
  MoreOutlined,
  RollbackOutlined,
  CheckOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import { Input, message, Button, Select, Empty, Menu, Dropdown, Tooltip } from 'antd';
import ReactDOM from 'react-dom';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import request from '@/utils/request';

import Less from './pdf.less';
import './pdf.css';

interface Props {
  blobUrl?: string; // 地址
  // [a: string]: any;
  // urlParams: UrlParams;
}
interface State {
  isLoadSuccess: boolean;
  [a: string]: any;
  moreOperate: { shelterPrint: boolean };
  canvasOperate: { startX: number; startY: number };
  currentCanvasNum: number | string;
  snapshotList: SnapshotList[];
  prevCanvasNum: number | string;
  urlParams: UrlParams;
}

type SnapshotList = {
  ctx: CanvasRenderingContext2D;
  imgData: ImageData;
  position?: Record<string, any>;
};

type UrlParams = {
  blobUrl?: string; // 地址
  colour?: boolean; // 是否打印彩色
  fileName?: string; // 文件名
  watermark?: boolean; // 是否显示水印按钮
  params?: any; // 请求接口参数
};

const DEFAULT_FONT_SIZE = 30;
const DEFAULT_FONT_ASCENT = 0.8;
const ascentCache = new Map();

function getAscent(fontFamily, ctx) {
  const cachedAscent = ascentCache.get(fontFamily);

  if (cachedAscent) {
    return cachedAscent;
  }

  ctx.save();
  ctx.font = `${DEFAULT_FONT_SIZE}px ${fontFamily}`;
  const metrics = ctx.measureText('');
  let ascent = metrics.fontBoundingBoxAscent;
  let descent = Math.abs(metrics.fontBoundingBoxDescent);

  if (ascent) {
    ctx.restore();
    const ratio = ascent / (ascent + descent);
    ascentCache.set(fontFamily, ratio);
    return ratio;
  }

  ctx.strokeStyle = 'red';
  ctx.clearRect(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE);
  ctx.strokeText('g', 0, 0);
  let pixels = ctx.getImageData(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE).data;
  descent = 0;

  for (let i = pixels.length - 1 - 3; i >= 0; i -= 4) {
    if (pixels[i] > 0) {
      descent = Math.ceil(i / 4 / DEFAULT_FONT_SIZE);
      break;
    }
  }

  ctx.clearRect(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE);
  ctx.strokeText('A', 0, DEFAULT_FONT_SIZE);
  pixels = ctx.getImageData(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE).data;
  ascent = 0;

  for (let i = 0, ii = pixels.length; i < ii; i += 4) {
    if (pixels[i] > 0) {
      ascent = DEFAULT_FONT_SIZE - Math.floor(i / 4 / DEFAULT_FONT_SIZE);
      break;
    }
  }

  ctx.restore();

  if (ascent) {
    const ratio = ascent / (ascent + descent);
    ascentCache.set(fontFamily, ratio);
    return ratio;
  }

  ascentCache.set(fontFamily, DEFAULT_FONT_ASCENT);
  return DEFAULT_FONT_ASCENT;
}

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  //注意base64的最后面中括号和引号是不转译的
  const _arr = arr[1].substring(0, arr[1].length - 2);
  // eslint-disable-next-line prefer-const
  let mime = arr[0].match(/:(.*?);/)[1],
    bstr = window.atob(_arr),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime,
  });
}

class PDF extends React.Component<Props, State> {
  state: State = {
    pdfPages: [],
    pdfPageLoad: {},
    pageCount: 0, // z总页数
    currentPage: 0, // 当前页
    pageLoading: {}, // 页面加载动画
    scale: 1, // 缩放比例
    renderTask: [], // 正在渲染的任务
    printProgressVisible: false, // 打印准备的进度条弹框
    printProgressPercent: 0, // 进度百分比
    readlyPrint: false, // 准备打印
    urlParams: {}, // url地址参数
    isLoadSuccess: true, // 是否加载成功
    moreOperate: { shelterPrint: false }, // 更多操作
    isStartShelter: false, // 是否开始绘画遮挡
    canvasOperate: { startX: 0, startY: 0 },
    currentCanvasNum: 1, // 当前操作的canvas
    snapshotList: [],

    prevCanvasNum: -1, // 前一个canvas画布
    pdfLoading: false, // pdf加载中的loading
    showWatermark: false, // 是否显示水印
    printBlobUrl: '', // 打印前的pdfurl
  };

  pdfjsLib: any;
  pdfPagesCanvasObj: Record<string, HTMLCanvasElement> = {}; // 页面canvas
  pdfContent: HTMLDivElement | null = null;
  pdfContentHeight: HTMLDivElement | null = null;
  // pageLoading: Record<string, boolean> = {};
  canvasRenderingObj: Record<string, boolean> = {}; // 是否正在渲染
  canvasRenderTextObj: Record<string, any> = {}; // 文字对象
  renderDivObj: Record<string, any> = {}; // 渲染页div宽高
  shelterCanvasObj: Record<string, HTMLCanvasElement> = {}; // 遮挡打印canva
  pdf: any;
  isRenderPage: Record<string, boolean> = {};
  timer: any; // 渲染页面定时
  timerPrev: any; // 渲染上一个页面定时
  timerPrev2: any; // 渲染上一个页面定时
  timerNext: any; // 渲染下一个页面定时
  timerNext2: any; // 渲染下一个页面定时
  scrollTimer: any; // 滚动定时器

  componentDidMount = () => {
    // this.pdfInit();
    window.parent.postMessage(JSON.stringify({ type: 'componentDidMount' }), '*');

    // 添加监听页面事件
    document.addEventListener('mousemove', this.canvasMouseMove);
    document.addEventListener('mouseup', this.canvasMouseUp);
    window.addEventListener('message', this.messageChange, false);
  };

  UNSAFE_componentWillReceiveProps = () => {
    console.log('组件重新render了');
  };

  componentWillUnmount = () => {
    document.removeEventListener('mousemove', this.canvasMouseMove);
    document.removeEventListener('mouseup', this.canvasMouseUp);
    document.removeEventListener('message', this.messageChange);
    window.URL.revokeObjectURL(this.state.urlParams.blobUrl);
  };

  // 修改pdf内容
  modifyPDF = async () => {
    try {
      const response = await fetch(this.state.urlParams.blobUrl!);

      const existingPdfBytes = await response.arrayBuffer();

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      // 注入字体
      pdfDoc.registerFontkit(window.fontkit);
      const font = await fetch(`/font/pdf.ttf`).then((res) => res.arrayBuffer());
      const helveticaFont = await pdfDoc.embedFont(font);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      // console.log('width', width, height, this.state.urlParams.watermark);
      firstPage.drawText(this.state.urlParams.watermark!, {
        x: 50,
        y: height - 100,
        size: 50,
        font: helveticaFont,
        color: rgb(0.95, 0.1, 0.1),
        rotate: degrees(45),
        opacity: 0.1,
      });

      // Serialize the PDFDocument to bytes (a Uint8Array)
      const pdfBytes = await pdfDoc.save();
      // console.log('pdfBytes', pdfBytes);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.state.urlParams.blobUrl = url;
      // console.log(this.state.urlParams.blobUrl);
      return true;
    } catch (error) {
      console.error('修改pdf内容失败，添加水印', error);
      return false;
    }
  };

  // 监听父级传过来的数据
  messageChange = (e) => {
    try {
      console.log('父级传过来的数据', e);
      const data = JSON.parse(e.data);
      if (data.type === 'refresh') {
        this.state.urlParams = data.config;
        this.init();
      }
      if (data.type === 'config') {
        this.state.urlParams = data.config;
        this.init();
      }
    } catch (error) {
      console.error(error);
      this.setState({ isLoadSuccess: false });
    }
  };

  pdfInit = async () => {
    this.setState({ pdfLoading: true });
    // window.URL.revokeObjectURL(this.state.urlParams.blobUrl);
    await this.getUrlParams();

    this.init();
  };

  // 获取url参数
  getUrlParams = async () => {
    const u = window.location.href;
    const index = u.indexOf('?');
    let parStr = '';
    if (index !== -1) {
      parStr = u.slice(index + 1);
    }
    const arr = parStr.split('&').filter((i) => i);
    const obj = {};
    arr.forEach((item) => {
      const str = decodeURIComponent(item);
      // const list = str.split('=');
      const idx = str.indexOf('=');
      const list = [str.slice(0, idx), str.slice(idx + 1)];

      if (list[1]) {
        const key = list[0];
        let value = list[1];
        if (key === 'config') {
          value = JSON.parse(value || JSON.stringify({}));
        }
        obj[key] = value;
      }
    });

    this.state.urlParams = obj.config;

    // 如果不是blobURl，则需要发请球拿到数据
    // if (!/^(blob|http)/.test(this.state.urlParams.blobUrl)) {
    //   const res = await request.get(this.state.urlParams.blobUrl!, {
    //     responseType: 'blob',
    //     params: this.state.urlParams.params,
    //   });
    //   this.state.urlParams.blobUrl = window.URL.createObjectURL(res);
    // }

    // this.state.urlParams.blobUrl =
    //   'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';

    return true;
  };

  // 初始化
  init = async () => {
    if (!this.state.urlParams.blobUrl) {
      console.error('请给定一个pdf的文件流');
      return;
    }
    // 如果需要添加水印
    if (this.state.urlParams.watermark) {
      const res = await this.modifyPDF();
      if (!res) {
        return;
      }
    }

    // window.URL.revokeObjectURL(this.state.urlParams.blobUrl);
    this.isRenderPage = {};
    this.pdfContent!.scrollTop = 0;
    this.state.currentPage = 1;
    this.pdfPagesCanvasObj = {};
    this.state.pdfPages = [];
    this.canvasRenderTextObj = {};
    this.canvasRenderingObj = {};
    // console.log(url);

    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    this.pdfjsLib = pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `/lib/pdf-js/pdf-worker.js`;
    this.setState({ pdfLoading: true });
    const loadingTask = pdfjsLib.getDocument({
      isPureXfa: true,
      url: this.state.urlParams.blobUrl,
      enableXfa: true,
    });

    // console.log('页面信息', loadingTask.stats);
    // console.log('PDF loaded', this.state.pdfLoading);

    loadingTask.promise.then(
      async (pdf: any) => {
        // console.log('PDF loaded', this.state.pdfLoading);
        this.pdf = pdf;
        this.state.pageCount = pdf.numPages;
        const list = Array(pdf.numPages)
          .fill(1)
          .map((_, index) => index + 1);

        this.setState({ pdfPages: list, isLoadSuccess: true });

        // 得到总高度
        const arr = [];
        for (let i = 0; i < pdf.numPages; i++) {
          arr.push(this.getPageHeight(pdf, 1 + i));
        }
        Promise.all(arr).then((heightArr) => {
          this.setState({ pdfLoading: false });
          // const h = heightArr.reduce((prev, cur) => prev + cur, 0);
          // this.pdfContentHeight!.style.height = h + 'px';
          this.setState({}, () => {
            this.renderPage(1, 0);
            setTimeout(() => {
              this.renderPage(2, 0);
            }, 20);
          });
        });
        //
      },

      (reason) => {
        this.setState({ pdfLoading: false });
        // PDF loading error
        console.error('pdf加载失败', reason);
        this.setState({ isLoadSuccess: false });
      },
    );
  };

  getPageHeight = async (pdf: any, pageNum: number) => {
    const page = await pdf.getPage(pageNum);
    this.state.pdfPageLoad[pageNum] = page;
    // console.log('Page loaded');

    // const scale = 2;
    const viewport = page.getViewport({ scale: this.state.scale });

    // Prepare canvas using PDF page dimensions
    const canvas = this.pdfPagesCanvasObj[pageNum];
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    return viewport.height;
  };

  // 选择文件
  selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e);
    const file = e.target.files![0];
    const url = window.URL.createObjectURL(file);

    this.isRenderPage = {};
    this.pdfContent!.scrollTop = 0;
    this.state.currentPage = 1;
    this.pdfPagesCanvasObj = {};
    this.state.pdfPages = [];
    this.canvasRenderTextObj = {};
    this.canvasRenderingObj = {};
    // console.log(url);

    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    this.pdfjsLib = pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/public/lib/pdf-js/pdf-worker.js';
    const loadingTask = pdfjsLib.getDocument({ isPureXfa: true, url, enableXfa: true });

    loadingTask.promise.then(
      async (pdf: any) => {
        // console.log('PDF loaded', pdf, pdf.numPages);
        this.pdf = pdf;
        this.state.pageCount = pdf.numPages;
        const list = Array(pdf.numPages)
          .fill(1)
          .map((_, index) => index + 1);

        this.setState({ pdfPages: list });

        // 得到总高度
        const arr = [];
        for (let i = 0; i < pdf.numPages; i++) {
          arr.push(this.getPageHeight(pdf, 1 + i));
        }
        Promise.all(arr).then((heightArr) => {
          // const h = heightArr.reduce((prev, cur) => prev + cur, 0);
          // this.pdfContentHeight!.style.height = h + 'px';
          this.setState({}, () => {
            this.renderPage(1, 0);
            setTimeout(() => {
              this.renderPage(2, 0);
            }, 20);
          });
        });
        //
      },

      function (reason) {
        // PDF loading error
        console.error(reason);
      },
    );
  };

  renderPageing = async (pageNum) => {
    try {
      if (this.isRenderPage[pageNum]) {
        return true;
      }
      if (this.state.pageLoading[pageNum]) {
        return true;
      }
      // console.log('开始渲染页面', type);
      this.state.pageLoading[pageNum] = true;
      this.setState({});

      const page = this.state.pdfPageLoad[pageNum];

      const viewport = page.getViewport({ scale: this.state.scale });
      const canvas = this.pdfPagesCanvasObj[pageNum];
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      this.renderDivObj[pageNum] = { height: canvas.height, width: canvas.width };
      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport,
        intent: 'print',
      };
      const renderTask = page.render(renderContext);
      // console.log('渲染任务', renderTask);
      this.canvasRenderingObj[pageNum] = renderTask;
      const result = await renderTask.promise;
      // console.log('渲染成功', a);
      this.canvasRenderingObj[pageNum] = false;
      this.isRenderPage[pageNum] = true;
      // console.log('页面渲染完成');
      this.state.pageLoading[pageNum] = false;
      this.setState({});
      return true;
    } catch (error) {
      console.log('渲染失败了');
      this.canvasRenderingObj[pageNum] = false;
      this.state.pageLoading[pageNum] = false;
      this.setState({});
      return false;
    }
  };

  // 渲染页
  renderPage = async (pageNum: number, isRenderText: boolean = true) => {
    if (!this.pdfPagesCanvasObj[pageNum]) {
      return true;
    }
    if (this.isRenderPage[pageNum]) {
      return true;
    }

    // 获取当前页
    this.getCurrentPage(true);
    // 如果渲染的页不在当前页上下，就停止渲染
    const newTask = [];
    this.state.renderTask.forEach((i) => {
      // console.log('正在渲染的', i, this.canvasRenderingObj[pageNum]);
      if (i > this.state.currentPage + 1 || i < this.state.currentPage - 1) {
        if (this.canvasRenderingObj[pageNum]) {
          this.canvasRenderingObj[pageNum].cancel();
          this.canvasRenderingObj[pageNum] = false;
        }
      } else {
        newTask.push(i);
      }
    });

    this.state.renderTask = newTask;

    if (this.canvasRenderingObj[pageNum]) {
      console.log('正在渲染');
      return true;
    }

    // console.log('开始渲染页面', type);
    this.state.pageLoading[pageNum] = true;
    this.setState({});

    const page = this.state.pdfPageLoad[pageNum];

    const viewport = page.getViewport({ scale: this.state.scale });
    // console.log('视口比例', viewport, page.userUnit);
    const canvas = this.pdfPagesCanvasObj[pageNum];
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    this.renderDivObj[pageNum] = { height: canvas.height, width: canvas.width };
    const ctx = canvas.getContext('2d');
    const renderContext = {
      canvasContext: ctx,
      viewport,
      intent: 'print',
    };
    const renderTask = page.render(renderContext);
    // console.log('渲染任务', renderTask);
    this.canvasRenderingObj[pageNum] = renderTask;
    this.state.renderTask.push(pageNum); // 加入到渲染任务中

    renderTask.promise
      .then(() => {
        // console.log('渲染成功', a);
        this.canvasRenderingObj[pageNum] = false;
        this.isRenderPage[pageNum] = true;
        // console.log('页面渲染完成');
        this.state.pageLoading[pageNum] = false;
        this.setState({});

        if (isRenderText) {
          page.getTextContent().then((res) => {
            // console.log('文字渲染', res, this.pdf.getAscent, this.pdfjsLib.getAscent);
            this.canvasRenderTextObj[pageNum] = res;
            this.setState({}, () => {
              setTimeout(() => {
                const div = this.pdfPagesCanvasObj[pageNum].parentElement;
                // console.log('span元素', div, div?.getElementsByClassName('span'));
                const spanList = div?.getElementsByClassName('span') || [];
                // spanList
                // const spanList = div?.getElementsByClassName('span') || [];
                for (let i = 0; i < spanList.length; i++) {
                  const textData = res.items[i];
                  const { styles } = res;
                  const tx = textData.transform;
                  const textDiv = spanList[i];
                  let angle = Math.atan2(tx[1], tx[0]);
                  const style = styles[textData.fontName];

                  if (style.vertical) {
                    angle += Math.PI / 2;
                  }

                  const fontHeight = Math.hypot(tx[2], tx[3]);
                  // const fontHeight = tx[0];
                  // const fontAscent = fontHeight;
                  const fontAscent = fontHeight * getAscent(style.fontFamily, ctx);
                  let left;
                  let top;

                  if (angle === 0) {
                    // eslint-disable-next-line prefer-destructuring
                    left = tx[4];
                    // top = tx[5] - fontAscent;
                  } else {
                    top = tx[5] - fontAscent * Math.cos(angle);
                  }
                  if (angle !== 0) {
                    angle *= 180 / Math.PI;
                  }

                  if (-angle > 0) {
                    left = tx[4] + fontAscent * Math.sin(angle) + Math.abs(angle);
                  } else {
                    left = tx[4] + fontAscent * Math.sin(angle) - Math.abs(angle);
                  }

                  textDiv.style.left = `${left * this.state.scale}px`;
                  // textDiv.style.top = `${top}px`;
                  textDiv.style.fontSize = `${fontHeight * this.state.scale}px`;
                  spanList[i].style.transform = `rotate(${-angle}deg) scaleX(${
                    (textData.width / spanList[i].clientWidth) * this.state.scale
                  })`;

                  // textDiv.style.fontFamily = style.fontFamily;
                  // textDiv.setAttribute('role', 'presentation');
                  // textDiv.textContent = textData.str;
                  // textDiv.dir = textData.dir;
                  // const textData = res.items[i];
                  // const { transform } = textData;
                  // const fontHeight = Math.hypot(transform[2], transform[3]);

                  // textData.rotate =
                  //   Math.atan2(textData.transform[1], textData.transform[0]) * (180 / Math.PI);

                  // spanList[i].style.transform = `rotate(${-textData.rotate}deg) scaleX(${
                  //   textData.width / spanList[i].clientWidth
                  // })`;

                  // // spanList[i].style.left = `${
                  // //   textData.transform[0] * canvas.width +
                  // //   textData.transform[2] * canvas.height +
                  // //   textData.transform[4]
                  // // }px`;
                  // spanList[i].style.fontSize = `${fontHeight}px`;
                  //
                }
              }, 20);
            });
          });
        }
        return true;
      })
      .catch((a) => {
        console.log('渲染失败了', pageNum, this.isRenderPage[pageNum], a);
        this.canvasRenderingObj[pageNum] = false;
        this.state.pageLoading[pageNum] = false;
        this.setState({});
        return false;
      });
  };

  // 内容滚动
  pdfContentScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    // console.log(this.pdf);
    clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      // console.log(e.target.scrollTop);

      this.getCurrentPage(true); // 得到当前页
      this.state.currentPage = parseInt(this.state.currentPage + '', 10);
      // console.log(e.target.scrollTop, this.state.currentPage);
      if (Object.keys(this.isRenderPage).length === this.state.pdfPages.length) {
        // console.log('页面都渲染完了');
        return;
      }

      // 渲染页面
      this.renderPageAnd2();
    }, 30);
  };

  // 点击上一页
  prevPageClick = () => {
    if (this.state.currentPage <= 1) {
      return;
    }
    this.state.currentPage -= 1;

    this.scrollAddress();
  };

  // 点击下一页
  nextPageClick = () => {
    if (this.state.currentPage === this.state.pdfPages.length) {
      return;
    }
    this.state.currentPage += 1;
    this.scrollAddress();
  };

  // 滚到的对应的位置
  scrollAddress = () => {
    this.pdfPagesCanvasObj[this.state.currentPage].scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      // console.log(this.state.currentPage);
      this.renderPage(this.state.currentPage);
    }, 400);
  };

  // 当前页改变触发
  currentPageChange = (e) => {
    const val = e.target.value;
    this.setState({ currentPage: val });
  };

  // 点击下载
  download = () => {
    // console.log(this.pdf.documentInfo, this.pdfjsLib.documentInfo,this.pdfjsLib.PDFWorkerParameters);
    this.pdf.getData().then((res) => {
      // console.log(res);
      const blob = new Blob([res], { type: 'application/pdf' });
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `${this.state.urlParams.fileName || Math.random()}.pdf`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });
  };

  // 获取当前页
  getCurrentPage = (isManualScroll: boolean) => {
    // 如果不是手动滚动就返回
    // if (!isManualScroll) {
    //   return;
    // }
    const { scrollTop } = this.pdfContent;
    let height = 0;
    for (let i = 0; i < this.state.pdfPages.length; i++) {
      const h = this.pdfPagesCanvasObj[i + 1].height + 4;
      height += h;
      if (scrollTop < height) {
        if (Math.abs(scrollTop - height) > h / 4) {
          this.state.currentPage = i + 1;
        } else {
          this.state.currentPage = i + 1;
        }

        break;
      }
    }

    this.setState({});
  };

  // 当前页回车改变
  currentPageKeyUp = (e) => {
    // console.log(e.keyCode);
    if (e.keyCode === 13) {
      this.currentPageBlur(e);
    }
  };

  // 触发跳转到指定页
  currentPageBlur = (e) => {
    const val = e.target.value;
    const len = this.state.pdfPages.length;
    const top = `请输入1-${len}之间的整数`;

    if (!/^[0-9]*$/.test(val)) {
      message.error(top);
      return;
    }
    const value = parseInt(val);
    if (value > len || value < 1) {
      message.error(top);
      return;
    }

    this.pdfPagesCanvasObj[value].scrollIntoView({ behavior: 'smooth' });
  };

  // 渲染页面并且渲染页面前后2页
  renderPageAnd2 = () => {
    // this.renderPage(this.state.currentPage - 2, 200, 'timerPrev2');
    this.renderPage(this.state.currentPage - 1);
    this.renderPage(this.state.currentPage);
    this.renderPage(this.state.currentPage + 1);
    this.renderPage(this.state.currentPage + 2);
    // this.renderPage(this.state.currentPage + 2, 200, 'timerNext2');
  };

  // 缩放改变
  scaleChange = (value) => {
    this.state.scale = value;
    this.isRenderPage = {};
    this.renderDivObj = {};
    this.canvasRenderTextObj = {};
    this.canvasRenderingObj = {};
    const arr = [];
    for (let i = 0; i < this.state.pdfPages.length; i++) {
      arr.push(this.getPageHeight(this.pdf, i + 1));
    }

    Promise.all(arr).then(() => {
      this.renderPageAnd2();
      this.state.snapshotList = [];
    });
  };

  // 点击方法缩小
  changeScale = (type: 'narrow' | 'enlarge') => {
    const v = parseInt(this.state.scale * 100 + '');
    const oldScale = v;
    let newValue = v;
    // 如果是缩小
    if (type === 'narrow') {
      newValue -= 20;
      if (newValue <= 15) {
        if (newValue === oldScale) {
          return;
        }
        newValue = 15;
      }
    }

    if (type === 'enlarge') {
      newValue += 20;
      if (newValue >= 400) {
        if (newValue === oldScale) {
          return;
        }
        newValue = 400;
      }
    }

    // 执行缩放方法
    // console.log(newValue);
    // newValue = parseInt(newValue * 1000 + '') / 1000;
    this.scaleChange(newValue / 100);
  };

  // 打印
  print = async (pdfUrl?: string) => {
    window.URL.revokeObjectURL(this.state.printBlobUrl);
    this.state.printBlobUrl = '';
    // 如果没有接收到一个pdfurl
    if (pdfUrl) {
      this.state.printBlobUrl = pdfUrl;
    } else {
      if (this.state.moreOperate.shelterPrint) {
        this.state.printBlobUrl = await this.addShelter();
      }
    }

    // console.log('遮挡打印的', this.state.snapshotList);
    const ifm = document.getElementsByClassName('iframe-print');
    for (let i = 0; i < ifm.length; i++) {
      const f = ifm[i];
      f.parentElement?.removeChild(f);
    }

    const iframe = document.createElement('iframe');
    iframe.src = this.state.printBlobUrl ? this.state.printBlobUrl : this.state.urlParams.blobUrl;
    iframe.classList.add('iframe-print');
    iframe.style.border = '0';
    iframe.style.height = '0px';
    iframe.style.position = 'fixed';

    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow.print();
    };

    return;
    // console.log(this.pdf.allXfaHtml);
    this.state.readlyPrint = true;
    this.state.printProgressVisible = true;
    this.state.printProgressPercent = 0;
    this.setState({});
    const task = [];
    const percent = 0;
    // this.state.pdfPages.forEach((num) => {
    //   task.push(
    //     this.renderPage(num, false).then((res) => {
    //       percent += 1;
    //       console.log(percent / this.state.pdfPages.length);
    //       return res;
    //     })
    //   );
    // });

    for (let i = 0; i < this.state.pdfPages.length; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve, reject) => {
          setTimeout(async () => {
            if (!this.state.readlyPrint) {
              reject(false);
            }
            await this.renderPageing(i + 1);
            resolve(true);
          }, 0);
        });
        this.state.printProgressPercent = parseInt((i / this.state.pdfPages.length) * 100 + '');
        // console.log(this.state.printProgressPercent);
        this.setState({});
      } catch (error) {
        // console.log('打破循环');
        break;
      }
      // console.log('渲染了', i / this.state.pdfPages.length);
    }

    if (this.state.readlyPrint) {
      this.setState({ readlyPrint: false, printProgressVisible: false });
      window.print();
    }

    // Promise.all(task).then((res) => {
    //   console.log(res);
    //   // setTimeout(() => {
    //   //   window.print();
    //   // }, 3000);
    // });
  };

  // 点击取消打印
  cancelPrint = () => {
    this.setState({ readlyPrint: false, printProgressVisible: false });
  };

  // 设置更多操作
  setMoreOperate = (type) => {
    this.state.moreOperate[type] = !this.state.moreOperate[type];
    this.setState({});
  };

  // canvas鼠标按下
  canvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, pageNum: number) => {
    if (!this.state.moreOperate.shelterPrint) {
      return;
    }
    // console.log('x', e.clientX, 'y', e.clientY, e);
    this.state.isStartShelter = true;
    this.state.currentCanvasNum = pageNum;

    this.state.canvasOperate.startX = e.clientX;
    this.state.canvasOperate.startY = e.clientY;
  };

  // canvas鼠标移动
  canvasMouseMove = (e: MouseEvent) => {
    if (!this.state.moreOperate.shelterPrint) {
      return;
    }
    if (!this.state.isStartShelter) {
      return;
    }
    const disX = e.clientX - this.state.canvasOperate.startX;
    const disY = e.clientY - this.state.canvasOperate.startY;
    const canvas = this.shelterCanvasObj[this.state.currentCanvasNum];
    const realCanvas = this.pdfPagesCanvasObj[this.state.currentCanvasNum];
    const ctx = canvas.getContext('2d')!;
    const rect = realCanvas.getBoundingClientRect();
    const left = this.state.canvasOperate.startX - rect.left;
    const top = this.state.canvasOperate.startY - rect.top;
    // 计矩形宽高
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(left, top, disX, disY);
    // ctx.save();
    // console.log('x', e.clientX, 'y', e.clientY);
    // this.state.isStartShelter = true;
  };

  // canvas鼠标弹起
  canvasMouseUp = (e: MouseEvent) => {
    if (!this.state.moreOperate.shelterPrint) {
      return;
    }
    if (this.state.isStartShelter) {
      const pageNum = this.state.currentCanvasNum;
      // console.log('pageNum', pageNum, this.state.prevCanvasNum);
      const canvas = this.pdfPagesCanvasObj[pageNum];
      // 如果有前一个画布
      if (pageNum === this.state.prevCanvas) {
        const prevCanvas = this.pdfPagesCanvasObj[this.state.prevCanvasNum];
        const ctx = prevCanvas.getContext('2d')!;
        const width = prevCanvas.width;
        const height = prevCanvas.height;
        const imgData = ctx.getImageData(0, 0, width, height);
        const obj = { imgData, ctx, pageNum };
        this.state.snapshotList.push(obj);
      } else {
        // console.log('新画布操作了');
        // 如果是新的画布操作
        const ctx = canvas.getContext('2d')!;
        const width = canvas.width;
        const height = canvas.height;
        const imgData = ctx.getImageData(0, 0, width, height);
        const obj = { imgData, ctx, pageNum };
        this.state.snapshotList.push(obj);
      }

      // 清空遮挡打印内容
      const shelterCanvas = this.shelterCanvasObj[pageNum];
      shelterCanvas.getContext('2d')?.clearRect(0, 0, shelterCanvas.width, shelterCanvas.height);

      // console.log('x', e.clientX, 'y', e.clientY, e);
      const disX = e.clientX - this.state.canvasOperate.startX;
      const disY = e.clientY - this.state.canvasOperate.startY;
      // console.log('disX', disX, 'disY', disY);

      this.state.prevCanvasNum = pageNum;

      const ctx = canvas.getContext('2d')!;
      const rect = canvas.getBoundingClientRect();
      const left = this.state.canvasOperate.startX - rect.left;
      const top = this.state.canvasOperate.startY - rect.top;
      // 计矩形宽高
      ctx.beginPath();
      ctx.fillRect(left, top, disX, disY);
      // ctx.save();
      // 添加当前遮挡的位置
      this.state.snapshotList[this.state.snapshotList.length - 1].position = {
        left,
        top,
        disX,
        disY,
      };

      this.state.isStartShelter = false;
    }
  };

  // 添加打印遮挡
  addShelter = async () => {
    // 如果是遮挡打印，就需要合并pdf
    if (this.state.moreOperate.shelterPrint) {
      const shelterPageList = [];
      const obj = {};
      this.state.snapshotList.forEach((i) => {
        if (!obj[i.pageNum]) {
          const width = i.ctx.canvas.width;
          const height = i.ctx.canvas.height;
          shelterPageList.push(i);
        }
      });

      try {
        const response = await fetch(this.state.urlParams.blobUrl!);

        const existingPdfBytes = await response.arrayBuffer();

        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();

        // const all = [];

        this.state.snapshotList.forEach((item) => {
          const canvas = this.pdfPagesCanvasObj[item.pageNum];
          const page = pages[item.pageNum - 1];
          const { left, top, disX, disY } = item.position!;
          const { height } = canvas;

          page.drawRectangle({
            x: left,
            y: height - top - disY,
            width: disX,
            height: disY,
            color: rgb(0, 0, 0),
          });
        });

        // await Promise.all(all);

        const nBlob = new Blob([await pdfDoc.save()], {
          type: 'application/pdf',
        });

        return window.URL.createObjectURL(nBlob);
      } catch (error) {
        console.error('遮挡打印是修改pdf失败', error);
        return false;
      }
    }
    return false;
  };

  // 点击切换水印
  toggleWatermark = () => {
    this.state.showWatermark = !this.state.showWatermark;
    window.parent.postMessage(
      JSON.stringify({ type: 'watermark', data: { showWatermark: this.state.showWatermark } }),
      '*',
    );
    // this.setState({});
    // this.pdfInit();
  };

  // 撤销遮挡
  revokeShelter = () => {
    // console.log(this.state.snapshotList);
    if (this.state.snapshotList.length > 0) {
      const data = this.state.snapshotList.pop()!;
      const { ctx, imgData } = data;
      // console.log(data);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.putImageData(imgData, 0, 0);
      // data.ctx.restore();
    }
  };

  // 打印当前页
  printCurrentPage = async () => {
    let url = this.state.urlParams.blobUrl!;
    // 如果有遮挡打印
    if (this.state.moreOperate.shelterPrint) {
      const u = await this.addShelter();
      if (u) {
        url = u;
      }
    }
    const pdfDoc = await PDFDocument.create();
    const pdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    const originPdfDoc = await PDFDocument.load(pdfBytes);
    const [page] = await pdfDoc.copyPages(originPdfDoc, [this.state.currentPage - 1]);
    pdfDoc.addPage(page);
    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const pdfUrl = window.URL.createObjectURL(blob);
    console.log('单页url', pdfUrl);
    this.print(pdfUrl);
  };

  render() {
    const { moreOperate, urlParams } = this.state;

    const menu = (
      <Menu className="no-print">
        <Menu.Item
          onClick={() => this.setMoreOperate('shelterPrint')}
          style={{ backgroundColor: moreOperate.shelterPrint ? '#ccc' : '' }}
        >
          <span>
            遮挡打印
            {moreOperate.shelterPrint && <CheckOutlined />}
          </span>
        </Menu.Item>
      </Menu>
    );

    const JSX = (
      <div className={`${Less.pdfComponent} print-overflow ${urlParams.colour ? 'colour' : ''}`}>
        <div className={`${Less.pdfjs} print-overflow`}>
          {/* 顶部内容 */}
          <div className="toolbar no-print">
            <div className="left item">
              <ArrowUpOutlined className="icon" title="上一页" onClick={this.prevPageClick} />

              <ArrowUpOutlined
                className="icon"
                title="下一页"
                style={{ transform: 'rotate(180deg)' }}
                onClick={this.nextPageClick}
              />

              <Input
                value={this.state.currentPage}
                onChange={this.currentPageChange}
                style={{ width: '60px', height: '24px', fontSize: '18px' }}
                // onBlur={this.currentPageBlur}
                onKeyUp={this.currentPageKeyUp}
              />
              <span>&nbsp;/&nbsp;{this.state.pdfPages.length}</span>
            </div>

            <div className="center item">
              <MinusOutlined className="icon" onClick={() => this.changeScale('narrow')} />
              <PlusOutlined className="icon" onClick={() => this.changeScale('enlarge')} />
              <Select
                value={parseInt(this.state.scale * 100 + '') + '%'}
                style={{ width: '100px' }}
                onChange={this.scaleChange}
                options={[
                  { label: '75%', value: 0.75 },
                  { label: '100%', value: 1 },
                  { label: '125%', value: 1.25 },
                  { label: '150%', value: 1.5 },
                  { label: '175%', value: 1.75 },
                  { label: '200%', value: 2 },
                  { label: '300%', value: 3 },
                ]}
              />
            </div>

            <div className="right item" onClick={(e) => e.stopPropagation()}>
              {/* 如果有遮挡打印就显示 */}
              {moreOperate.shelterPrint && (
                <Tooltip placement="bottom" title="撤销">
                  <RollbackOutlined className="icon" onClick={this.revokeShelter} />
                </Tooltip>
              )}

              {this.state.urlParams.watermark && (
                <Tooltip placement="bottom" title="水印" className="no-print">
                  <BgColorsOutlined className="icon" onClick={this.toggleWatermark} />
                </Tooltip>
              )}

              <Tooltip placement="bottom" title="打印当前页" className="no-print">
                <PrinterOutlined
                  style={{ color: '#2f78ed' }}
                  className="icon"
                  onClick={this.printCurrentPage}
                />
              </Tooltip>

              <Tooltip placement="bottom" title="打印" className="no-print">
                <PrinterOutlined className="icon" onClick={() => this.print()} />
              </Tooltip>

              <Tooltip placement="bottom" title="下载">
                <DownloadOutlined className="icon" onClick={this.download} />
              </Tooltip>

              <Dropdown overlay={menu} trigger={['click']}>
                <MoreOutlined className="icon" onClick={(e) => e.preventDefault()} />
              </Dropdown>
            </div>
          </div>

          <div
            onScroll={(e) => this.pdfContentScroll(e)}
            className="pdf-content"
            style={{ userSelect: moreOperate.shelterPrint ? 'none' : 'initial' }}
            ref={(d) => {
              this.pdfContent = d!;
            }}
          >
            {/* 加载成功 */}
            {this.state.isLoadSuccess &&
              this.state.pdfPages.map((num) => {
                return (
                  <div
                    key={num}
                    style={{ textAlign: 'center' }}
                    className={`${moreOperate.shelterPrint ? 'shelter-print' : ''}`}
                  >
                    <div
                      style={{
                        lineHeight: 0,
                        position: 'relative',
                        margin: '0  auto 4px',
                        flexShrink: 0,
                        display: 'inline-block',
                        ...(this.renderDivObj[num] || {}),
                      }}
                    >
                      <canvas
                        key={num + 'canvas'}
                        style={{ backgroundColor: '#fff' }}
                        ref={(d) => {
                          this.pdfPagesCanvasObj[num] = d!;
                        }}
                      />
                      <canvas
                        key={num + 'shelter'}
                        width={this.renderDivObj[num]?.width}
                        height={this.renderDivObj[num]?.height}
                        onMouseDown={(e) => this.canvasMouseDown(e, num)}
                        className="shelter-canvas"
                        ref={(d) => {
                          this.shelterCanvasObj[num] = d!;
                        }}
                        style={{ display: moreOperate.shelterPrint ? 'block' : 'none' }}
                      />
                      {this.state.pageLoading[num] && (
                        <div className="loading-box">
                          {/* <Spin spinning={this.state.pageLoading[num]}></Spin> */}
                          <div className="loading-wrap">
                            <div className="item-loading" />
                            <div className="item-loading" />
                            <div className="item-loading" />
                            <div className="item-loading" />
                            <div className="item-loading" />
                            <div className="item-loading" />
                            <div className="item-loading" />
                            <div className="item-loading" />
                          </div>
                        </div>
                      )}

                      {/* 文字层 */}
                      {this.canvasRenderTextObj[num] && (
                        <div
                          className="text-payer no-print"
                          style={{ display: moreOperate.shelterPrint ? 'none' : '' }}
                        >
                          {this.canvasRenderTextObj[num].items.map((item, index) => {
                            let brJSX = null;
                            if (item.hasEOL) {
                              brJSX = <br key={index + 'br'} />;
                            }
                            const styles = this.canvasRenderTextObj[num].styles;
                            return (
                              <>
                                <span
                                  className="span"
                                  key={index}
                                  dir={item.dir}
                                  style={{
                                    // fontSize: item.transform[3] * this.state.scale,
                                    // left: item.transform[4] * this.state.scale,
                                    top:
                                      this.renderDivObj[num]?.height -
                                      (item.transform[5] + item.transform[3]) * this.state.scale +
                                      0.25 * item.transform[3],
                                    fontFamily: styles[item.fontName].fontFamily,
                                    // transform: `scaleX(${
                                    //   styles[item.fontName].ascent - styles[item.fontName].descent
                                    // })`,
                                    // transform: `scaleX(${
                                    //   item.width / ((item.transform[4] * item.transform[0]) / 10)
                                    // } )`,
                                  }}
                                >
                                  {item.str}
                                </span>
                                {brJSX}
                              </>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* 加载失败 */}
            {!this.state.isLoadSuccess && <Empty className="empty" description="加载失败了" />}

            {/* 数据加载中 */}
            {this.state.pdfLoading && (
              <div className="loading-box">
                {/* <Spin spinning={this.state.pageLoading[num]}></Spin> */}
                <div className="loading-wrap">
                  <div className="item-loading" />
                  <div className="item-loading" />
                  <div className="item-loading" />
                  <div className="item-loading" />
                  <div className="item-loading" />
                  <div className="item-loading" />
                  <div className="item-loading" />
                  <div className="item-loading" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 打印加载进度 */}
        {this.state.printProgressVisible && (
          <div className="mantle no-print">
            <div className="print-pregress-box ">
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div className="progress-box">
                  <div
                    className="progress"
                    style={{ width: this.state.printProgressPercent + '%' }}
                  />
                </div>
                <div>{this.state.printProgressPercent}%</div>
              </div>
              <Button className="cancel" onClick={this.cancelPrint}>
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
    );

    return JSX;
  }
}

export default () => {
  useEffect(() => {
    ReactDOM.render(<PDF />, document.getElementById('root'));
  }, []);
  return null;
};
