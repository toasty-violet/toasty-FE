const SUPPORT_EMAIL = "toasty.p3@gmail.com";

export function SupportCard() {
  return (
    <section className="bg-bg-layer-default rounded-12 flex w-full flex-col gap-16 p-16">
      <div className="flex w-full items-start gap-12">
        <h2 className="text-b3-medium text-fg-neutral-solid shrink-0">
          문의 접수
        </h2>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-b4-regular text-fg-neutral-solid min-w-0 flex-1 text-right break-all"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>
    </section>
  );
}
