"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CustomerInfoForm } from "@/components/forms/CustomerInfoForm";
import { fetchCustomerProfile, updateCustomerProfile } from "@/lib/user";

//마이페이지에서 이미 등록한 구매자 정보를 고치는 화면
export function CustomerProfileEditForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: fetchCustomerProfile,
  });

  const mutation = useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: () => {
      // 마이페이지가 방금 고친 값을 보여주도록 조회를 무효화한다.
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
      router.replace("/me");
    },
  });

  // 조회한 값으로 폼을 초기화하므로, 값이 도착한 뒤에 마운트한다.
  if (!profile) {
    return (
      <p
        role={isError ? "alert" : undefined}
        className="text-b4-regular text-fg-neutral-secondary flex flex-1 px-20 pt-20"
      >
        {isPending
          ? "회원 정보를 불러오는 중이에요."
          : "회원 정보를 불러오지 못했어요."}
      </p>
    );
  }

  return (
    <CustomerInfoForm
      initialValues={profile}
      submitLabel={mutation.isPending ? "저장 중…" : "저장"}
      isPending={mutation.isPending}
      onSubmit={mutation.mutate}
    />
  );
}
