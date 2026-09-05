/**
 * ShareUnitButton — copy bài viết + link chia sẻ từng căn hộ.
 * File mới 100%. Bài viết lấy brand/hotline/link từ settings thật.
 */

import React, { useState } from 'react';
import { Share2, Link2, FileText, Check } from 'lucide-react';
import { ApartmentUnit, AppSettings } from '../types';
import {
  buildUnitUrl,
  buildUnitPost,
  copyTextToClipboard,
  nativeShare,
  getSavedRef,
  saveRef,
} from '../lib/unitShare';

interface ShareUnitButtonProps {
  apartment: ApartmentUnit;
  settings: AppSettings;
  compact?: boolean;
}

type DoneKind = 'post' | 'link' | 'share' | null;

export const ShareUnitButton: React.FC<ShareUnitButtonProps> = ({ apartment, settings, compact }) => {
  const [done, setDone] = useState<DoneKind>(null);
  const [failed, setFailed] = useState(false);
  const [refName, setRefName] = useState(getSavedRef);
  const canNativeShare =
    typeof navigator !== 'undefined' && 'share' in navigator;

  const flash = (kind: Exclude<DoneKind, null>) => {
    setDone(kind);
    setFailed(false);
    setTimeout(() => setDone(null), 2500);
  };

  const handleRefChange = (value: string) => {
    setRefName(value);
    saveRef(value);
  };

  const handleCopyPost = async () => {
    const post = buildUnitPost(apartment, settings, buildUnitUrl(apartment.unitCode, refName));
    const ok = await copyTextToClipboard(post);
    if (ok) flash('post');
    else setFailed(true);
  };

  const handleCopyLink = async () => {
    const ok = await copyTextToClipboard(buildUnitUrl(apartment.unitCode, refName));
    if (ok) flash('link');
    else setFailed(true);
  };

  const handleNativeShare = async () => {
    const url = buildUnitUrl(apartment.unitCode, refName);
    const post = buildUnitPost(apartment, settings, url);
    const ok = await nativeShare(
      `${apartment.unitTypeName} ${apartment.unitCode}`,
      post,
      url
    );
    if (ok) flash('share');
    else handleCopyPost();
  };

  const btn =
    'inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer';

  return (
    <div className={compact ? 'flex items-center' : 'space-y-1.5'}>
      {!compact && (
        <input
          type="text"
          value={refName}
          onChange={(e) => handleRefChange(e.target.value)}
          placeholder="Tên bạn/kênh (gắn vào link)"
          maxLength={40}
          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-200"
        />
      )}
      <div className="flex items-center space-x-1.5">
      <button
        onClick={handleCopyPost}
        title="Copy bài viết đầy đủ thông tin để gửi Zalo/Facebook"
        className={`${btn} ${
          done === 'post'
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-900 hover:bg-slate-700 text-white'
        }`}
      >
        {done === 'post' ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        <span className="hidden sm:inline">{done === 'post' ? 'Đã copy bài!' : 'Copy bài'}</span>
      </button>
      <button
        onClick={handleCopyLink}
        title="Copy link mở thẳng căn này"
        className={`${btn} ${
          done === 'link'
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
        }`}
      >
        {done === 'link' ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        <span className="hidden sm:inline">{done === 'link' ? 'Đã copy!' : 'Link'}</span>
      </button>
      {canNativeShare && (
        <button
          onClick={handleNativeShare}
          title="Chia sẻ qua ứng dụng"
          className={`${btn} bg-blue-600 hover:bg-blue-700 text-white`}
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}
      {failed && (
        <span className="text-[11px] text-red-600 font-semibold">Copy thất bại, thử lại</span>
      )}
      </div>
    </div>
  );
};
