export function reservationInstruction() {
    const year = new Date().getFullYear();
    return [
        "사용자가 예약을 원하는 경우, 예약자 성명, 전화번호, 예약일, 예약시간을 물어주세요.",
        "이 정보는 한 번에 하나씩 질문해주세요.",
        "정보를 다 모은 뒤에는 JSON 객체로 사용자에게 보여주세요.",
        `예약일은 YY.MM.DD 포맷, 예약시간은 HH:MM 포맷으로 표시합니다. 연도가 없다면 ${year}년을 사용하세요.`,
        "JSON 객체는 name, phone, date, time 필드를 포함하며, \"request\": \"reservationcheck\" 필드를 먼저 넣어야 합니다.",
        "사용자가 확인하면 동일한 구조에 \"request\": \"reservation\" 필드를 넣은 최종 JSON 객체를 만들어주세요."
    ].join(' ');
}

export function cancelInstruction() {
    const year = new Date().getFullYear();
    return [
        "사용자가 예약을 취소하려는 경우, 예약자 성명, 전화번호, 예약일, 예약시간을 물어보세요.",
        "정보는 한 번에 하나씩 질문해주세요.",
        "정보를 다 모은 후 JSON 객체로 사용자에게 보여주세요.",
        `예약일은 YY.MM.DD 포맷, 예약시간은 HH:MM 포맷으로 표시하며, 연도가 없다면 ${year}년을 사용하세요.`,
        "객체에는 name, phone, date, time 필드가 있고, \"request\": \"cancelcheck\" 필드가 먼저 있어야 합니다.",
        "사용자 확인 후에는 \"request\": \"cancel\" 이 포함된 객체를 만들어주세요."
    ].join(' ');
}

export function scopeInstruction() {
    return "질문에 대한 응답은 앞서 제공된 정보 내에서만 하며, 사실과 다르게 대답하지 마세요.";
}

export function rawdataInstruction(rawdata) {
    return `${rawdata}

위 데이터를 기반으로 ChatGPT가 사용자의 질문에 응답할 수 있도록 학습할 예정입니다.
다음과 같은 구조의 JSON 객체 하나를 반환해주세요:

{
  "role": "system",
  "content": { 병원 관련 구조화 정보 (예: 병원이름, 주소 등) },
  "questions": [ 질문 리스트 (최대 100개) ]
}

주의사항:
- 실제 내용이 있는 질문만 생성해주세요.
- key 이름은 번역하지 마세요.
- 다른 설명 없이 JSON 객체만 반환해주세요.`;
}

export function excelQNArawdataInstruction(rawdata) {
    return `${rawdata}\n이 Excel 데이터를 JSON 형식으로 바꿔주세요. Q./A 구조입니다.`;
}
