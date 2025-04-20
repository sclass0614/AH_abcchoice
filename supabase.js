// Supabase 클라이언트 설정
const SUPABASE_URL = "https://dfomeijvzayyszisqflo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk";

// Supabase 클라이언트 초기화 함수
async function createClient() {
  if (!window.supabase) {
    // Supabase 클라이언트 라이브러리 동적 로드
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4';
      script.onload = () => {
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        resolve(client);
      };
      script.onerror = () => {
        reject(new Error('Supabase 클라이언트 라이브러리 로드 실패'));
      };
      document.head.appendChild(script);
    });
  } else {
    return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
}

// 선택한 날짜에 해당하는 회원 데이터를 가져오는 함수
async function getselectedMemberData(selectedDate) {
  try {
    const client = await createClient();

    // 회원 데이터 조회 (상담회원 제외, 입소일과 퇴소일 범위에 있는 회원만)
    const { data, error } = await client
      .from('membersinfo')
      .select('회원번호, 회원명, 생년월일, 입소일, 퇴소일')
      .neq('회원번호', '상담회원')
      .lte('입소일', selectedDate)
      .gte('퇴소일', selectedDate);

    if (error) throw error;

    // 반환 형식 변환 (2차원 배열로)
    const formattedValues = data.map(member => [
      member.회원번호,
      member.회원명,
      member.생년월일,
      member.입소일,
      member.퇴소일
    ]);

    return formattedValues;
  } catch (error) {
    console.error('회원 데이터 조회 오류:', error);
    return [];
  }
}

// 선택한 날짜에 해당하는 수업계획 데이터를 가져오는 함수
async function getselectedPlanData(selectedDate) {
  try {
    const client = await createClient();

    // 해당 날짜의 수업계획 데이터 조회
    const { data, error } = await client
      .from('activities_plan')
      .select('*')
      .eq('날짜', selectedDate);

    if (error) throw error;

    // 반환 형식 변환 (배열로)
    const formattedValues = data.map(plan => [
      plan.계획_id,
      plan.날짜,
      plan.시작시간,
      plan.종료시간,
      plan.직원번호,
      plan.직원명,
      plan.활동명,
      plan.생활영역,
      plan.장소,
      plan.준비물품,
      plan.내용및특이사항,
      plan.활동기록,
      plan.참고사진URL
    ]);

    return formattedValues;
  } catch (error) {
    console.error('수업계획 데이터 조회 오류:', error);
    return [];
  }
}

// 선택한 날짜에 해당하는 수업신청 데이터를 가져오는 함수
async function getselectedClassData(selectedDate) {
  try {
    const client = await createClient();

    // 해당 날짜의 수업신청 데이터 조회
    const { data, error } = await client
      .from('activities_choice')
      .select('*')
      .eq('날짜', selectedDate);

    if (error) throw error;

    // 반환 형식 변환 (배열로)
    const formattedValues = data.map(choice => [
      choice.수업신청_id,
      choice.계획_id,
      choice.날짜,
      choice.차수,
      choice.시작시간,
      choice.종료시간,
      choice.직원번호,
      choice.직원명,
      choice.활동명,
      choice.생활영역,
      choice.회원번호,
      choice.회원명,
      choice.생년월일
    ]);

    return formattedValues;
  } catch (error) {
    console.error('수업신청 데이터 조회 오류:', error);
    return [];
  }
}

// 테이블 구조 확인 함수 추가
async function getTableStructure(tableName) {
  try {
    const client = await createClient();

    // 테이블의 데이터를 1개만 가져오기(구조 확인 목적)
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`${tableName} 테이블 구조:`, Object.keys(data[0]));
      return Object.keys(data[0]);
    } else {
      console.log(`${tableName} 테이블에 데이터가 없습니다.`);
      return [];
    }
  } catch (error) {
    console.error(`테이블 구조 조회 오류:`, error);
    return [];
  }
}

// 컬럼명을 확인하는 함수
async function checkColumns() {
  await getTableStructure('activities_choice');
  await getTableStructure('activities_plan');
  await getTableStructure('membersinfo');
}

// 수정된 활동 신청 추가 함수 
async function appendClassrowFixed(rowsData) {
  try {
    if (!rowsData || !Array.isArray(rowsData) || rowsData.length === 0) {
      return {
        success: false,
        message: "추가할 데이터가 없습니다."
      };
    }

    const client = await createClient();

    // 기존 데이터 삭제 (같은 회원, 같은 날짜)
    const memberNumber = rowsData[0][10]; // 첫 번째 행에서 회원번호 가져오기
    const dateValue = rowsData[0][2]; // 첫 번째 행에서 날짜 가져오기

    // 기존 데이터 삭제
    const { error: deleteError } = await client
      .from('activities_choice')
      .delete()
      .eq('회원번호', memberNumber)
      .eq('날짜', dateValue);

    if (deleteError) throw deleteError;

    // 데이터 형식 변환 (배열 -> 객체)
    const newRowsObjects = rowsData.map(row => {
      // [0]수업신청_id, [1]계획_id, [2]날짜, [3]차수, [4]시작시간, [5]종료시간, 
      // [6]직원번호, [7]담당자(직원명), [8]활동명, [9]생활영역, [10]회원번호, [11]회원명, [12]생년월일

      // 디버깅용 로그 추가
      console.log("직원명 데이터:", row[7]);

      return {
        // 수업신청_id는 자동 생성되므로 제외
        계획_id: row[1],
        날짜: parseInt(row[2]), // int4 타입이므로 숫자로 변환
        차수: row[3],
        시작시간: row[4],
        종료시간: row[5],
        직원번호: row[6],
        직원명: row[7], // 직원명으로 수정
        활동명: row[8],
        생활영역: row[9],
        회원번호: row[10],
        회원명: row[11],
        생년월일: parseInt(row[12]) // int4 타입이므로 숫자로 변환
      };
    });

    console.log("수정된 형식으로 Supabase에 전송할 데이터:", newRowsObjects);

    // 새 데이터 추가
    const { error: insertError } = await client
      .from('activities_choice')
      .insert(newRowsObjects);

    if (insertError) {
      console.error("데이터 삽입 오류:", insertError);
      throw insertError;
    }

    return {
      success: true,
      message: `${rowsData.length}개의 활동 신청 데이터가 추가되었습니다.`,
      addedRows: rowsData.length
    };
  } catch (error) {
    console.error('활동 신청 데이터 추가 오류:', error);
    return {
      success: false,
      message: `오류가 발생했습니다: ${error.message}`,
      error: error.toString()
    };
  }
}

// 회원의 모든 활동 신청을 취소하는 함수
async function cancelAllClasses(memberNumber, dateValue) {
  try {
    const client = await createClient();

    // 해당 회원과 날짜의 데이터 삭제
    const { data: deletedData, error } = await client
      .from('activities_choice')
      .delete()
      .eq('회원번호', memberNumber)
      .eq('날짜', dateValue)
      .select();

    if (error) throw error;

    const deletedCount = deletedData ? deletedData.length : 0;

    return {
      success: true,
      message: deletedCount > 0
        ? `${deletedCount}개의 활동 신청이 취소되었습니다.`
        : "취소할 활동 신청이 없습니다.",
      deletedCount: deletedCount
    };
  } catch (error) {
    console.error('활동 신청 취소 오류:', error);
    return {
      success: false,
      message: `오류가 발생했습니다: ${error.message}`,
      error: error.toString()
    };
  }
}

// 컬럼명 다양한 형식으로 테스트하는 함수
async function appendClassrowWithVariations(rowsData) {
  try {
    if (!rowsData || !Array.isArray(rowsData) || rowsData.length === 0) {
      return {
        success: false,
        message: "추가할 데이터가 없습니다."
      };
    }

    const client = await createClient();

    // 테이블 구조 확인
    await getTableStructure('activities_choice');

    // 기존 데이터 삭제 (같은 회원, 같은 날짜)
    const memberNumber = rowsData[0][10]; // 첫 번째 행에서 회원번호 가져오기
    const dateValue = rowsData[0][2]; // 첫 번째 행에서 날짜 가져오기

    // 기존 데이터 삭제
    const { error: deleteError } = await client
      .from('activities_choice')
      .delete()
      .eq('회원번호', memberNumber)
      .eq('날짜', dateValue);

    if (deleteError) throw deleteError;

    // 데이터 형식 변환 (배열 -> 객체)
    const newRowsObjects = rowsData.map(row => {
      // [0]수업신청_id, [1]계획_id, [2]날짜, [3]차수, [4]시작시간, [5]종료시간, 
      // [6]직원번호, [7]담당자(직원명), [8]활동명, [9]생활영역, [10]회원번호, [11]회원명, [12]생년월일

      // 로그 출력
      console.log("행 데이터 확인:", row);
      console.log("직원명(index 7):", row[7]);

      const obj = {
        // 기본 필드들
        계획_id: row[1],
        날짜: parseInt(row[2]), // int4 타입이므로 숫자로 변환
        차수: row[3],
        시작시간: row[4],
        종료시간: row[5],
        직원번호: row[6],
        직원명: row[7], // 직원명으로 수정
        활동명: row[8],
        생활영역: row[9],
        회원번호: row[10],
        회원명: row[11],
        생년월일: parseInt(row[12]) // int4 타입이므로 숫자로 변환
      };

      return obj;
    });

    console.log("직원명 컬럼 사용 데이터:", newRowsObjects);

    // 새 데이터 추가
    const { error: insertError } = await client
      .from('activities_choice')
      .insert(newRowsObjects);

    if (insertError) {
      console.error("데이터 삽입 오류:", insertError);
      throw insertError;
    }

    return {
      success: true,
      message: `${rowsData.length}개의 활동 신청 데이터가 추가되었습니다.`,
      addedRows: rowsData.length
    };
  } catch (error) {
    console.error('활동 신청 데이터 추가 오류:', error);
    return {
      success: false,
      message: `오류가 발생했습니다: ${error.message}`,
      error: error.toString()
    };
  }
}

// 활동 신청 데이터를 추가하는 함수 - 다양한 방식 시도
async function appendClassrow(rowsData) {
  try {
    console.log("활동 신청 데이터 추가 함수 호출됨");

    // 테이블 구조 확인
    const columns = await getTableStructure('activities_choice');

    // 직원명 컬럼이 존재하는지 확인
    const hasInstructorColumn = columns.includes('직원명');
    console.log("'직원명' 컬럼 존재 여부:", hasInstructorColumn);

    if (!hasInstructorColumn) {
      console.log("직원명 컬럼이 없어 다양한 형식으로 시도합니다.");
      return await appendClassrowWithVariations(rowsData);
    } else {
      console.log("직원명 컬럼이 존재하여 기본 함수를 사용합니다.");
      return await appendClassrowFixed(rowsData);
    }
  } catch (error) {
    console.error("활동 신청 추가 함수 오류:", error);
    // 오류 발생 시 원래 함수 사용
    return await appendClassrowFixed(rowsData);
  }
} 