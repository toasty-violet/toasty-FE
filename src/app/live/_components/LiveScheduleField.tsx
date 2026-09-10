"use client";

import { useRef } from "react";

import CalendarIcon from "@/assets/Calendar.svg";
import RightSmallIcon from "@/assets/RightSmall.svg";
import TimeIcon from "@/assets/Time.svg";

const DATE_LABEL = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

const TIME_LABEL = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
});

type Row = {
  icon: typeof CalendarIcon;
  label: string;
  value: string;
  inputType: "date" | "time";
  inputValue: string;
  onChange: (next: string) => void;
};

function ScheduleRow({
  icon: Icon,
  label,
  value,
  inputType,
  inputValue,
  onChange,
}: Row) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex w-full items-center gap-6">
      <Icon className="size-24 shrink-0" />
      <span className="text-l3-medium text-fg-neutral-solid shrink-0">
        {label}
      </span>
      <span className="text-l3-regular text-fg-neutral-secondary flex-1 text-right">
        {value}
      </span>
      <RightSmallIcon className="size-24 shrink-0" />

      {/* 행 전체를 덮어 어디를 눌러도 네이티브 피커가 열리게 한다. */}
      <input
        ref={inputRef}
        type={inputType}
        value={inputValue}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        onClick={() => inputRef.current?.showPicker?.()}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </div>
  );
}

export function LiveScheduleField({
  scheduledAt,
  onChange,
}: {
  scheduledAt: Date;
  onChange: (next: Date) => void;
}) {
  const dateValue = toDateInput(scheduledAt);
  const timeValue = toTimeInput(scheduledAt);

  return (
    <div className="flex w-full flex-col gap-16 p-20">
      <ScheduleRow
        icon={CalendarIcon}
        label="날짜"
        value={DATE_LABEL.format(scheduledAt)}
        inputType="date"
        inputValue={dateValue}
        onChange={(next) => next && onChange(fromInputs(next, timeValue))}
      />
      <ScheduleRow
        icon={TimeIcon}
        label="시간"
        value={TIME_LABEL.format(scheduledAt)}
        inputType="time"
        inputValue={timeValue}
        onChange={(next) => next && onChange(fromInputs(dateValue, next))}
      />
    </div>
  );
}

// date/time 입력은 로컬 시각 문자열을 쓴다. toISOString 을 거치면 UTC 로 밀린다.
function toDateInput(at: Date) {
  const month = `${at.getMonth() + 1}`.padStart(2, "0");
  const day = `${at.getDate()}`.padStart(2, "0");
  return `${at.getFullYear()}-${month}-${day}`;
}

function toTimeInput(at: Date) {
  const hours = `${at.getHours()}`.padStart(2, "0");
  const minutes = `${at.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function fromInputs(date: string, time: string) {
  return new Date(`${date}T${time}`);
}
