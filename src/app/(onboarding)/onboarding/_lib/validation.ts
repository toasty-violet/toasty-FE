// 구매자·셀러 온보딩 폼이 함께 쓰는 입력값 검증 규칙.
// 닉네임 규칙은 중복 조회와 짝을 이루므로 use-nickname-check 가 갖는다.
export const NAME_PATTERN = /^[가-힣a-zA-Z]{2,20}$/; //이름 규칙
export const PHONE_PATTERN = /^01[016789][0-9]{7,8}$/; //핸드폰 번호 규칙

/** 하이픈을 걷어낸 숫자만 남긴다. 검증과 표시 모두 숫자 기준으로 다룬다. */
export const onlyDigits = (value: string) => value.replace(/[^0-9]/g, "");
