-- Supabase > SQL Editor 에 통째로 붙여넣고 Run (기존 데이터는 그대로 유지돼요)
create table if not exists users(
  id text primary key,
  username text unique not null,   -- 로그인용 아이디 (다른 사람에게 보이지 않아요)
  salt text not null,
  hash text not null,              -- 비밀번호는 암호화(해시)해서만 저장돼요
  ts bigint);
create table if not exists sessions(
  token_hash text primary key,
  uid text not null,
  exp bigint not null);
create table if not exists legacy_claims(
  old_uid text primary key,        -- 예전(로그인 전) 기기 기록을 계정으로 옮긴 내역
  uid text not null);
 
-- 규칙(policy)을 일부러 만들지 않아요: 계정 정보는 서버(secret key)만 읽고 쓸 수 있어요.
alter table users enable row level security;
alter table sessions enable row level security;
alter table legacy_claims enable row level security;
 
