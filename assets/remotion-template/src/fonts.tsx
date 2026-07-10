/* 本地字体加载(思源宋体,大标题用)。组件内 delayRender/continueRender,渲染前等字体就绪。 */
import React, {useState, useEffect} from 'react';
import {staticFile, delayRender, continueRender} from 'remotion';

export const FontLoader: React.FC = () => {
  const [handle] = useState(() => delayRender('load-fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Noto Serif SC', `url(${staticFile('fonts/NotoSerifSC-700.woff2')})`, {weight: '700'}),
      new FontFace('Noto Serif SC', `url(${staticFile('fonts/NotoSerifSC-400.woff2')})`, {weight: '400'}),
    ];
    Promise.all(faces.map((f) => f.load().then((l) => (document as any).fonts.add(l))))
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
  return null;
};
