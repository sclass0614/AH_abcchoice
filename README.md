# 일상선택 애플리케이션

## 프로젝트 개요

이 프로젝트는 회원 활동 계획 및 신청을 관리하는 웹 애플리케이션입니다. 구글 스프레드시트를 사용하던 기존 시스템에서 Supabase 백엔드로 마이그레이션되었습니다.

## 기술 스택

- 프론트엔드: HTML, JavaScript
- 백엔드: Supabase
- 데이터베이스: PostgreSQL (Supabase 제공)

## 데이터베이스 구조

### membersinfo 테이블

- 회원번호 (text): 회원 고유 식별자
- 회원명 (text): 회원 이름
- 생년월일 (int4): 회원 생년월일 (YYYYMMDD 형식)
- 입소일 (int4): 입소 날짜 (YYYYMMDD 형식)
- 퇴소일 (int4): 퇴소 날짜 (YYYYMMDD 형식)

### activities_plan 테이블

- 계획\_id (uuid): 활동 계획 고유 식별자
- 날짜 (int4): 활동 날짜 (YYYYMMDD 형식)
- 시작시간 (text): 활동 시작 시간
- 종료시간 (text): 활동 종료 시간
- 직원번호 (text): 담당 직원 번호
- 직원명 (text): 직원명 이름
- 활동명 (text): 활동 이름
- 생활영역 (text): 활동 영역
- 장소 (text): 활동 장소
- 준비물품 (text): 필요한 준비물
- 내용및특이사항 (text): 활동 내용 설명
- 활동기록 (text): 활동 결과 기록
- 참고사진URL (text): 참고 이미지 URL

### activities_choice 테이블

- 수업신청\_id (uuid): 활동 신청 고유 식별자
- 계획\_id (text): 연결된 활동 계획 ID
- 날짜 (int4): 활동 날짜 (YYYYMMDD 형식)
- 차수 (text): 활동 차수
- 시작시간 (text): 활동 시작 시간
- 종료시간 (text): 활동 종료 시간
- 직원번호 (text): 담당 직원 번호
- 직원명 (text): 직원명 이름
- 활동명 (text): 활동 이름
- 생활영역 (text): 활동 영역
- 회원번호 (text): 신청 회원 번호
- 회원명 (text): 신청 회원 이름
- 생년월일 (int4): 회원 생년월일 (YYYYMMDD 형식)
- created_at (timestamp): 생성 시간

## 기능

- 날짜별 회원 목록 조회
- 날짜별 활동 계획 조회
- 회원별 활동 신청 및 취소

## 설치 및 실행

1. 프로젝트 파일을 다운로드합니다.
2. 웹 서버에 파일을 업로드합니다.
3. index.html을 열어 애플리케이션을 실행합니다.
