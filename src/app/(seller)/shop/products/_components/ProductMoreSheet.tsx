"use client";

import type { FC, SVGProps } from "react";

import EditIcon from "@/assets/Edit.svg";
import DeleteIcon from "@/assets/Trash.svg";
import { BottomSheet } from "@/components/overlays/BottomSheet";

function SheetItem({
  label,
  icon: Icon,
  critical = false,
  onClick,
}: {
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  critical?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-l2-semibold flex w-full items-center gap-12 py-12 text-left ${
        critical ? "text-fg-critical" : "text-fg-neutral-solid"
      }`}
    >
      {/* 아이콘 색이 박혀 있어 글자색을 따라가게 한다. */}
      <Icon className="size-24 shrink-0 [&_path]:fill-current" />
      {label}
    </button>
  );
}

/** 상품 카드의 더보기에서 열린다. */
export function ProductMoreSheet({
  open,
  productName,
  onClose,
  onEdit,
  onDelete,
}: {
  open: boolean;
  productName: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={productName} hideTitle>
      <div className="flex w-full flex-col">
        <SheetItem label="수정하기" icon={EditIcon} onClick={onEdit} />
        <SheetItem
          label="삭제하기"
          icon={DeleteIcon}
          critical
          onClick={onDelete}
        />
      </div>
    </BottomSheet>
  );
}
