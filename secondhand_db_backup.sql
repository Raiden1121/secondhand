--
-- PostgreSQL database dump
--

\restrict cqxUtqWdc2gQwNFftMshMHCY3laiipDqMIEhDm9AIH7em3rdhxEGeSIqtoTf1Ia

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO "user";

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: user
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Chat; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Chat" (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Chat" OWNER TO "user";

--
-- Name: Chat_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Chat_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Chat_id_seq" OWNER TO "user";

--
-- Name: Chat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Chat_id_seq" OWNED BY public."Chat".id;


--
-- Name: Favorite; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Favorite" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "productId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Favorite" OWNER TO "user";

--
-- Name: Favorite_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Favorite_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Favorite_id_seq" OWNER TO "user";

--
-- Name: Favorite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Favorite_id_seq" OWNED BY public."Favorite".id;


--
-- Name: Message; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Message" (
    id integer NOT NULL,
    content text,
    "senderId" integer NOT NULL,
    "chatId" integer NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    image text,
    "productId" integer
);


ALTER TABLE public."Message" OWNER TO "user";

--
-- Name: Message_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Message_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Message_id_seq" OWNER TO "user";

--
-- Name: Message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Message_id_seq" OWNED BY public."Message".id;


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Notification" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data text
);


ALTER TABLE public."Notification" OWNER TO "user";

--
-- Name: Notification_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Notification_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Notification_id_seq" OWNER TO "user";

--
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    title text NOT NULL,
    price integer NOT NULL,
    description text NOT NULL,
    images text NOT NULL,
    category text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "sellerId" integer NOT NULL,
    location text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    condition text DEFAULT '全新'::text NOT NULL,
    reserved boolean DEFAULT false NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    "deliveryMethod" text DEFAULT '面交'::text NOT NULL,
    negotiable boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Product" OWNER TO "user";

--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Product_id_seq" OWNER TO "user";

--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: Rating; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Rating" (
    id integer NOT NULL,
    "transactionId" integer NOT NULL,
    "raterId" integer NOT NULL,
    "ratedUserId" integer NOT NULL,
    score integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Rating" OWNER TO "user";

--
-- Name: Rating_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Rating_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Rating_id_seq" OWNER TO "user";

--
-- Name: Rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Rating_id_seq" OWNED BY public."Rating".id;


--
-- Name: Report; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Report" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "productId" integer NOT NULL,
    reason text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Report" OWNER TO "user";

--
-- Name: Report_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Report_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Report_id_seq" OWNER TO "user";

--
-- Name: Report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Report_id_seq" OWNED BY public."Report".id;


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Transaction" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    "buyerId" integer NOT NULL,
    "sellerId" integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO "user";

--
-- Name: Transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Transaction_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Transaction_id_seq" OWNER TO "user";

--
-- Name: Transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Transaction_id_seq" OWNED BY public."Transaction".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    avatar text,
    department text,
    "studentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    gender text,
    phone text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "resetPasswordExpires" timestamp(3) without time zone,
    "resetPasswordToken" text,
    "verificationToken" text
);


ALTER TABLE public."User" OWNER TO "user";

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO "user";

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _DeletedChats; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."_DeletedChats" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_DeletedChats" OWNER TO "user";

--
-- Name: _UserChats; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."_UserChats" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_UserChats" OWNER TO "user";

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO "user";

--
-- Name: Chat id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Chat" ALTER COLUMN id SET DEFAULT nextval('public."Chat_id_seq"'::regclass);


--
-- Name: Favorite id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Favorite" ALTER COLUMN id SET DEFAULT nextval('public."Favorite_id_seq"'::regclass);


--
-- Name: Message id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Message" ALTER COLUMN id SET DEFAULT nextval('public."Message_id_seq"'::regclass);


--
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: Rating id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Rating" ALTER COLUMN id SET DEFAULT nextval('public."Rating_id_seq"'::regclass);


--
-- Name: Report id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Report" ALTER COLUMN id SET DEFAULT nextval('public."Report_id_seq"'::regclass);


--
-- Name: Transaction id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Transaction" ALTER COLUMN id SET DEFAULT nextval('public."Transaction_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Chat; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Chat" (id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Favorite; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Favorite" (id, "userId", "productId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Message" (id, content, "senderId", "chatId", read, "createdAt", image, "productId") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Notification" (id, "userId", type, title, content, read, "createdAt", data) FROM stdin;
3	2	message	新訊息	蔡瑞陽: 很好吃	f	2026-03-09 09:38:39.811	{"chatId":1}
4	2	rate_prompt	交易完成	您購買「迪可」的交易已確認，請評價賣家	f	2026-03-09 09:38:45.898	{"transactionId":1}
8	5	message	新訊息	蔡瑞陽: 你好	f	2026-03-11 05:09:09.501	{"chatId":2}
9	4	purchase_cancelled	購買請求已取消	賣家已取消您對「迪可」的購買請求	f	2026-03-11 05:09:29.513	{"productId":1}
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Product" (id, title, price, description, images, category, status, "sellerId", location, "createdAt", "updatedAt", condition, reserved, deleted, "deliveryMethod", negotiable) FROM stdin;
1	迪可	6699	這是我的大迪可	["/uploads/1773048799999-910354469.jpg"]	美妝	sold	1	管理二館	2026-03-09 09:33:20.103	2026-03-10 03:50:21.907	二手	f	t	面交	t
2	DJI pocket 3 creator combo	14500	全新未拆 未使用 未開保	["/uploads/1773116478209-195953600.webp"]	3C 電子與周邊	active	1	管理二館、管理一館 (志希館)、男九舍、中大會館	2026-03-10 04:11:07.508	2026-03-10 04:21:18.302	全新	f	f	面交、寄送	f
4	二手腳踏車	1000	1	["/uploads/1773645796200-825151221.jpg"]	交通工具	active	1	人文社會科學大樓	2026-03-16 07:23:16.212	2026-03-16 07:26:10.108	全新	f	t	面交	f
5	全新鍵盤	1080	1	["/uploads/1773645849705-817353339.jpg"]	3C 電子與周邊	active	1		2026-03-16 07:24:09.71	2026-03-16 07:26:15.21	全新	f	t	寄送	f
3	Principles of Financial Accounting IFRS Edition, Third Edition, 3rd Edition	500	1	["/uploads/1773645758905-991143853.jpg"]	教科書與書籍	active	1	文學一館	2026-03-16 07:22:39.002	2026-03-16 07:26:18.209	全新	f	t	面交	f
\.


--
-- Data for Name: Rating; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Rating" (id, "transactionId", "raterId", "ratedUserId", score, comment, "createdAt") FROM stdin;
1	1	1	2	1	迪可不好吃 太小了	2026-03-09 09:39:08.304
\.


--
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Report" (id, "userId", "productId", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Transaction" (id, "productId", "buyerId", "sellerId", status, "createdAt", "updatedAt") FROM stdin;
1	1	2	1	confirmed	2026-03-09 09:38:15.3	2026-03-09 09:38:45.7
2	1	4	1	cancelled	2026-03-10 04:25:11.609	2026-03-11 05:09:29.501
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."User" (id, email, password, name, avatar, department, "studentId", "createdAt", "updatedAt", gender, phone, "isVerified", "resetPasswordExpires", "resetPasswordToken", "verificationToken") FROM stdin;
6	jecelec664@hlkes.com	$2b$10$2e6R8YXNGxUYpBAWbUwL9ex5hjAk.N3dDBSmTffmUWS8kNwtBZoyK	TEST	\N	資工系	01	2026-03-16 07:19:14.601	2026-03-16 07:19:34.801	other		t	\N	\N	\N
1	shak941121@gmail.com	688e3d48d97af7ae9076e874f05afdf0	蔡瑞陽	/uploads/1773114723499-227774970.jpg	資訊管理學系	113403537	2026-03-09 05:53:42.316	2026-03-16 07:26:04.603	male		f	\N	\N	\N
2	dexic69612@cslua.com	$2b$10$Mcn3un.2vS6pkkZ8KBIP1e.FzqrrNUWoVgnP/shjFQdcjv06pyyNa	蔡仁懋 甲	\N	資管系	0	2026-03-09 09:37:15.905	2026-03-09 09:37:40.71	male		t	\N	\N	\N
3	ray2017good@gmail.com	0b9d252ba207c0dbc403dc43768323f8	陳紀睿	👤	資訊管理學系	113403054	2026-03-09 12:59:59.394	2026-03-09 13:00:19.413	female	878787878787878	f	\N	\N	\N
4	m20060719@gmail.com	147755efea4d6cd065685aa5760fe1e6	蔡仁懋	/uploads/1773062728410-761597093.jpg	資訊管理學系	113403023	2026-03-09 13:23:24.598	2026-03-09 13:25:28.416			f	\N	\N	\N
5	andy0625huang@gmail.com	117d0b6f881f5809f3d7b0994a85acfc	黃丞胤	👤	\N	113403021	2026-03-11 04:58:33.898	2026-03-11 05:04:08.816	\N	\N	f	\N	\N	\N
\.


--
-- Data for Name: _DeletedChats; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."_DeletedChats" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _UserChats; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."_UserChats" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
541b13f6-ec78-4ef4-ba3e-4ac2e834ad16	630eb006a2b584857d454e033b8f322034d4c33e264cf36e51a8615873e4dd0f	2026-03-07 12:55:48.723315+00	20260101164732_add_student_id	\N	\N	2026-03-07 12:55:48.699831+00	1
7111b0bd-580b-4047-b50b-e7477c1d7c4e	7eee63b5a6ab1d6524cbc8d612152506aa85481bec3978db76d98f1a1a5591a4	2026-03-07 12:55:48.730196+00	20260102091124_add_favorite_model	\N	\N	2026-03-07 12:55:48.723935+00	1
3f67ce36-8141-4ac2-8721-14d2f0e09b8d	69652f9cc80adaff98a16b116e6ae7e74963ff919c62e1139f689a8917fb01eb	2026-03-07 12:55:48.735451+00	20260102152634_add_product_condition	\N	\N	2026-03-07 12:55:48.730772+00	1
15197191-e9fc-4252-83ec-be7c6f1dd3d1	d32ca5fbc778cfc95e2cb531a628c5af9f54f9f1578238fceb32e52acaa1c8ea	2026-03-07 12:55:48.745035+00	20260102162611_add_favorites_and_reports	\N	\N	2026-03-07 12:55:48.736071+00	1
3e6a140a-c269-4475-bdfe-99c345db5e48	1e69b0b0fdb54b9215d632478abc596b84e965c2abc5e47290b1d17517925f92	2026-03-07 12:55:48.747826+00	20260102172603_add_message_image	\N	\N	2026-03-07 12:55:48.745598+00	1
01e1a1c0-25e5-45b2-a8f0-5db7bd025ac8	adf22a887289c799aa6e47e8f97183e5f4e128b46986184a6639148b549cc487	2026-03-07 12:55:48.751128+00	20260103095935_add_product_to_message	\N	\N	2026-03-07 12:55:48.748385+00	1
fb86a95a-e12b-40ef-8863-506e1a37d053	edb60bcb52b764622746c7fb57be3eedf410d2058957dbf0d8ba7832e19d9c67	2026-03-07 12:55:48.753766+00	20260105101655_add_reserved_field	\N	\N	2026-03-07 12:55:48.751688+00	1
7ee8ce96-2c25-40a0-a46e-432c7fcf5490	1b43c320094e556c5cffe901c07eae166e3509a0e5cd6a3e4be06e3910db8aa5	2026-03-07 12:55:48.76576+00	20260105172029_add_transaction_rating	\N	\N	2026-03-07 12:55:48.754352+00	1
\.


--
-- Name: Chat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Chat_id_seq"', 2, true);


--
-- Name: Favorite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Favorite_id_seq"', 1, false);


--
-- Name: Message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Message_id_seq"', 4, true);


--
-- Name: Notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Notification_id_seq"', 9, true);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Product_id_seq"', 5, true);


--
-- Name: Rating_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Rating_id_seq"', 1, true);


--
-- Name: Report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Report_id_seq"', 1, false);


--
-- Name: Transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Transaction_id_seq"', 2, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."User_id_seq"', 6, true);


--
-- Name: Chat Chat_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT "Chat_pkey" PRIMARY KEY (id);


--
-- Name: Favorite Favorite_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Rating Rating_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_pkey" PRIMARY KEY (id);


--
-- Name: Report Report_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _DeletedChats _DeletedChats_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."_DeletedChats"
    ADD CONSTRAINT "_DeletedChats_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _UserChats _UserChats_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."_UserChats"
    ADD CONSTRAINT "_UserChats_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Favorite_userId_productId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Favorite_userId_productId_key" ON public."Favorite" USING btree ("userId", "productId");


--
-- Name: Rating_transactionId_raterId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Rating_transactionId_raterId_key" ON public."Rating" USING btree ("transactionId", "raterId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_studentId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "User_studentId_key" ON public."User" USING btree ("studentId");


--
-- Name: _DeletedChats_B_index; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "_DeletedChats_B_index" ON public."_DeletedChats" USING btree ("B");


--
-- Name: _UserChats_B_index; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX "_UserChats_B_index" ON public."_UserChats" USING btree ("B");


--
-- Name: Favorite Favorite_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Favorite Favorite_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Favorite"
    ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chat"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Rating Rating_ratedUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_ratedUserId_fkey" FOREIGN KEY ("ratedUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Rating Rating_raterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Rating Rating_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public."Transaction"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Report Report_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Report Report_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _DeletedChats _DeletedChats_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."_DeletedChats"
    ADD CONSTRAINT "_DeletedChats_A_fkey" FOREIGN KEY ("A") REFERENCES public."Chat"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DeletedChats _DeletedChats_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."_DeletedChats"
    ADD CONSTRAINT "_DeletedChats_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserChats _UserChats_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."_UserChats"
    ADD CONSTRAINT "_UserChats_A_fkey" FOREIGN KEY ("A") REFERENCES public."Chat"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserChats _UserChats_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."_UserChats"
    ADD CONSTRAINT "_UserChats_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict cqxUtqWdc2gQwNFftMshMHCY3laiipDqMIEhDm9AIH7em3rdhxEGeSIqtoTf1Ia

