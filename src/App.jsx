import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Plus, Upload, Clock, Trash2, Edit3, Download, ChevronLeft, ChevronRight,
  X, Check, Loader2, Globe, Hash, AlertCircle, CheckCircle2,
  Search, Users, Bell, Star, MapPin, Mail,
  BarChart3, Compass, RefreshCw, LogOut
} from "lucide-react";
import { supabase } from "./supabaseClient";

/* ── Brand Palette ───────────────────────────────────── */
const C = {
  bg:"#F3EDE4",bgWarm:"#EDE6DA",bgCard:"#FFFDF8",bgInput:"#F8F4EC",
  accent:"#C75B2A",accentSoft:"rgba(199,91,42,0.10)",accentHover:"#B04E20",
  olive:"#4A6741",oliveSoft:"rgba(74,103,65,0.10)",
  navy:"#2C3E6B",navySoft:"rgba(44,62,107,0.10)",
  sand:"#D4A96A",sandSoft:"rgba(212,169,106,0.12)",
  text:"#2A2520",textMuted:"#8B7E6A",textDim:"#B5A998",
  border:"#E2D9CB",success:"#4A6741",danger:"#9B3022",cream:"#FFFDF8",
};

const genId = () => Math.random().toString(36).substr(2, 9);

const AIRLINES = {
  UA:"United Airlines",AA:"American Airlines",DL:"Delta Air Lines",WN:"Southwest Airlines",
  B6:"JetBlue Airways",AS:"Alaska Airlines",NK:"Spirit Airlines",F9:"Frontier Airlines",
  HA:"Hawaiian Airlines",G4:"Allegiant Air",SY:"Sun Country",
  BA:"British Airways",LH:"Lufthansa",AF:"Air France",KL:"KLM Royal Dutch",
  EK:"Emirates",QR:"Qatar Airways",SQ:"Singapore Airlines",AZ:"ITA Airways",
  LX:"Swiss International",TK:"Turkish Airlines",AC:"Air Canada",QF:"Qantas",
  NH:"All Nippon Airways",JL:"Japan Airlines",OS:"Austrian Airlines",EY:"Etihad Airways",
  CX:"Cathay Pacific",KE:"Korean Air",OZ:"Asiana Airlines",CI:"China Airlines",
  BR:"EVA Air",MH:"Malaysia Airlines",TG:"Thai Airways",GA:"Garuda Indonesia",
  AI:"Air India",ET:"Ethiopian Airlines",SA:"South African Airways",
  LO:"LOT Polish",SK:"SAS Scandinavian",AY:"Finnair",IB:"Iberia",
  TP:"TAP Air Portugal",EI:"Aer Lingus",VY:"Vueling",FR:"Ryanair",
  U2:"easyJet",W6:"Wizz Air",PC:"Pegasus Airlines",
  AM:"Aeromexico",AV:"Avianca",LA:"LATAM Airlines",CM:"Copa Airlines",
  AR:"Aerolineas Argentinas",JQ:"Jetstar",NZ:"Air New Zealand",FJ:"Fiji Airways",
  VA:"Virgin Australia",VS:"Virgin Atlantic",WS:"WestJet",
  QK:"Jazz Aviation",ZX:"Air Georgian",
  HU:"Hainan Airlines",MU:"China Eastern",CA:"Air China",CZ:"China Southern",
  SU:"Aeroflot",S7:"S7 Airlines",KC:"Air Astana",
  MS:"EgyptAir",RJ:"Royal Jordanian",GF:"Gulf Air",WY:"Oman Air",
  PK:"PIA",UL:"SriLankan Airlines",BG:"Biman Bangladesh",
  PR:"Philippine Airlines",CEB:"Cebu Pacific",AK:"AirAsia",
  "5J":"Cebu Pacific",
};

/* ── 300+ Airport Coordinates ────────────────────────── */
const AP = {
  JFK:[40.64,-73.78],EWR:[40.69,-74.17],LGA:[40.77,-73.87],
  LAX:[33.94,-118.41],SFO:[37.62,-122.38],SJC:[37.36,-121.93],OAK:[37.72,-122.22],
  ORD:[41.97,-87.91],MDW:[41.79,-87.75],
  ATL:[33.64,-84.43],DFW:[32.90,-97.04],DAL:[32.85,-96.85],
  MIA:[25.79,-80.29],FLL:[26.07,-80.15],PBI:[26.68,-80.10],MCO:[28.43,-81.31],TPA:[27.98,-82.53],JAX:[30.49,-81.69],RSW:[26.54,-81.76],
  BOS:[42.36,-71.01],PVD:[41.73,-71.43],BDL:[41.94,-72.68],
  SEA:[47.45,-122.31],PDX:[45.59,-122.60],
  DEN:[39.86,-104.67],COS:[38.81,-104.70],
  IAD:[38.95,-77.46],DCA:[38.85,-77.04],BWI:[39.18,-76.67],
  PHX:[33.44,-112.01],TUS:[32.12,-110.94],
  IAH:[29.98,-95.34],HOU:[29.65,-95.28],SAT:[29.53,-98.47],AUS:[30.19,-97.67],
  SAN:[32.73,-117.19],
  MSP:[44.88,-93.22],DTW:[42.21,-83.35],
  PHL:[39.87,-75.24],CLT:[35.21,-80.94],RDU:[35.88,-78.79],
  LAS:[36.08,-115.15],SLC:[40.79,-111.98],
  BNA:[36.12,-86.68],MEM:[35.04,-89.98],
  STL:[38.75,-90.37],MCI:[39.30,-94.71],
  IND:[39.72,-86.29],CMH:[39.99,-82.89],CLE:[41.41,-81.85],CVG:[39.05,-84.66],PIT:[40.50,-80.23],
  MKE:[42.95,-87.90],MSN:[43.14,-89.34],
  OMA:[41.30,-95.89],DSM:[41.53,-93.66],
  RNO:[39.50,-119.77],BOI:[43.56,-116.22],
  ABQ:[35.04,-106.61],ELP:[31.81,-106.38],
  OKC:[35.39,-97.60],TUL:[36.20,-95.89],
  BUF:[42.94,-78.73],ROC:[43.12,-77.67],SYR:[43.11,-76.11],ALB:[42.75,-73.80],
  SDF:[38.17,-85.74],LEX:[38.04,-84.61],
  RIC:[37.51,-77.32],ORF:[36.89,-76.20],
  CHS:[32.90,-80.04],SAV:[32.13,-81.20],
  MSY:[29.99,-90.26],
  ANC:[61.17,-149.99],FAI:[64.81,-147.86],
  HNL:[21.32,-157.92],OGG:[20.90,-156.43],LIH:[21.98,-159.34],KOA:[19.74,-156.05],
  PSP:[33.83,-116.51],SNA:[33.68,-117.87],BUR:[34.20,-118.36],ONT:[34.06,-117.60],LGB:[33.82,-118.15],
  SMF:[38.70,-121.59],
  PWM:[43.65,-70.31],
  BTV:[44.47,-73.15],MHT:[42.93,-71.44],
  YYZ:[43.68,-79.63],YVR:[49.19,-123.18],YUL:[45.47,-73.74],
  YOW:[45.32,-75.67],YYC:[51.13,-114.01],YEG:[53.31,-113.58],
  YWG:[49.91,-97.24],YHZ:[44.88,-63.51],YQB:[46.79,-71.39],
  YKF:[43.46,-80.38],YXE:[52.17,-106.70],YQR:[50.43,-104.67],
  YYJ:[48.65,-123.43],YXX:[49.03,-122.36],YLW:[49.96,-119.38],
  YQT:[48.37,-89.32],YFC:[45.87,-66.54],YSJ:[45.32,-65.89],
  YXU:[43.04,-81.15],YQM:[46.11,-64.68],
  MEX:[19.44,-99.07],CUN:[21.04,-86.87],GDL:[20.52,-103.31],
  SJD:[23.15,-109.72],PVR:[20.68,-105.25],MTY:[25.78,-100.11],
  MID:[20.94,-89.66],CZM:[20.52,-86.93],
  SJU:[18.44,-66.00],STT:[18.34,-64.97],STX:[17.70,-64.80],
  NAS:[25.04,-77.47],MBJ:[18.50,-77.91],KIN:[17.94,-76.79],
  PUJ:[18.57,-68.36],SDQ:[18.43,-69.67],
  AUA:[12.50,-70.02],CUR:[12.17,-68.96],SXM:[18.04,-63.11],
  GCM:[19.29,-81.36],POS:[10.60,-61.34],BGI:[13.07,-59.49],
  PTY:[9.07,-79.38],SAL:[13.44,-89.06],GUA:[14.58,-90.53],
  SJO:[9.99,-84.21],LIR:[10.59,-85.54],BZE:[17.54,-88.31],
  BOG:[4.70,-74.15],MDE:[6.16,-75.43],CLO:[3.54,-76.38],CTG:[10.44,-75.51],
  LIM:[-12.02,-77.11],CUZ:[-13.54,-71.94],
  GRU:[-23.43,-46.47],GIG:[-22.81,-43.25],BSB:[-15.87,-47.92],
  CNF:[-19.63,-43.97],REC:[-8.13,-34.92],SSA:[-12.91,-38.33],
  SCL:[-33.39,-70.79],EZE:[-34.82,-58.54],AEP:[-34.56,-58.42],
  MVD:[-34.84,-56.03],ASU:[-25.24,-57.52],VVI:[-17.64,-63.14],
  UIO:[-0.13,-78.49],GYE:[-2.16,-79.88],
  CCS:[10.60,-66.99],
  LHR:[51.47,-0.46],LGW:[51.15,-0.19],STN:[51.89,0.24],LTN:[51.87,-0.37],
  MAN:[53.35,-2.27],BHX:[52.45,-1.75],EDI:[55.95,-3.37],GLA:[55.87,-4.43],
  BRS:[51.38,-2.72],LPL:[53.33,-2.85],NCL:[55.04,-1.69],
  BFS:[54.66,-6.22],BHD:[54.62,-5.87],
  DUB:[53.42,-6.27],SNN:[52.70,-8.92],ORK:[51.84,-8.49],KNO:[53.91,-8.82],
  CDG:[49.01,2.55],ORY:[48.72,2.36],NCE:[43.66,7.21],LYS:[45.73,5.09],
  MRS:[43.44,5.21],TLS:[43.63,1.37],BOD:[44.83,-0.72],NTE:[47.15,-1.61],
  AMS:[52.31,4.77],EIN:[51.45,5.37],RTM:[51.96,4.44],
  BRU:[50.90,4.48],LUX:[49.63,6.21],
  FRA:[50.03,8.57],MUC:[48.35,11.79],BER:[52.36,13.51],DUS:[51.29,6.77],
  HAM:[53.63,9.99],CGN:[50.87,7.14],STR:[48.69,9.22],HAJ:[52.46,9.69],
  NUE:[49.50,11.07],LEJ:[51.42,12.24],DRS:[51.13,13.77],
  ZRH:[47.46,8.55],GVA:[46.24,6.11],BSL:[47.59,7.53],
  BCN:[41.30,2.08],MAD:[40.47,-3.57],PMI:[39.55,2.74],AGP:[36.67,-4.50],
  ALC:[38.28,-0.56],VLC:[39.49,-0.47],IBZ:[38.87,1.37],
  SVQ:[37.42,-5.90],BIO:[43.30,-2.91],SCQ:[42.90,-8.42],
  FCO:[41.80,12.25],MXP:[45.63,8.72],LIN:[45.45,9.28],
  VCE:[45.51,12.35],NAP:[40.88,14.29],BLQ:[44.53,11.29],
  FLR:[43.81,11.20],PSA:[43.68,10.39],CTA:[37.47,15.07],PMO:[38.18,13.09],
  OLB:[40.90,9.52],CAG:[39.25,9.06],BRI:[41.14,16.76],
  ATH:[37.94,23.94],SKG:[40.52,22.97],HER:[35.34,25.18],
  JMK:[37.44,25.35],JTR:[36.40,25.48],CFU:[39.60,19.91],RHO:[36.41,28.09],
  LIS:[38.77,-9.13],OPO:[41.24,-8.68],FAO:[37.01,-7.97],FNC:[32.69,-16.77],
  IST:[41.28,28.73],SAW:[40.90,29.31],AYT:[36.90,30.80],ADB:[38.29,27.16],
  ESB:[40.13,32.00],DLM:[36.71,28.79],BJV:[37.25,27.67],
  CPH:[55.62,12.66],OSL:[60.19,11.10],BGO:[60.29,5.23],
  ARN:[59.65,17.94],GOT:[57.66,12.28],
  HEL:[60.32,24.97],
  VNO:[54.63,25.29],RIX:[56.92,23.97],TLL:[59.41,24.83],
  WAW:[52.17,20.97],KRK:[50.08,19.78],WRO:[51.10,16.89],GDN:[54.38,18.47],
  PRG:[50.10,14.26],BTS:[48.17,17.21],BUD:[47.44,19.26],
  OTP:[44.57,26.08],CLJ:[46.79,23.69],SOF:[42.70,23.41],
  VIE:[48.11,16.57],SZG:[47.79,13.00],INN:[47.26,11.34],
  ZAG:[45.74,16.07],SPU:[43.54,16.30],DBV:[42.56,18.27],
  BEG:[44.82,20.31],LJU:[46.22,14.46],TIV:[42.40,18.72],
  KIV:[46.93,28.93],
  DXB:[25.25,55.36],AUH:[24.43,54.65],SHJ:[25.33,55.52],
  DOH:[25.26,51.57],BAH:[26.27,50.64],KWI:[29.23,47.97],
  MCT:[23.59,58.28],RUH:[24.96,46.70],JED:[21.68,39.16],
  MED:[24.55,39.71],DMM:[26.47,49.80],
  TLV:[32.01,34.87],AMM:[31.72,35.99],BEY:[33.82,35.49],
  CAI:[30.12,31.40],HRG:[27.18,33.80],SSH:[27.98,34.39],
  CMN:[33.37,-7.59],RAK:[31.61,-8.04],TNG:[35.73,-5.92],FEZ:[33.93,-4.98],
  ALG:[36.69,3.22],TUN:[36.85,10.23],
  NBO:[-1.32,36.93],MBA:[-4.03,39.59],
  DAR:[-6.88,39.20],ZNZ:[-6.22,39.22],KGL:[-1.97,30.14],EBB:[0.04,32.44],
  ADD:[8.98,38.80],
  JNB:[-26.14,28.24],CPT:[-33.97,18.60],DUR:[-29.97,31.12],
  WDH:[-22.48,17.47],GBE:[-24.56,25.92],HRE:[-17.93,31.09],
  LOS:[6.58,3.32],ABV:[9.01,7.26],ACC:[5.61,-0.17],
  DSS:[14.74,-17.49],ABJ:[5.26,-3.93],
  DEL:[28.56,77.10],BOM:[19.09,72.87],BLR:[13.20,77.71],
  MAA:[12.99,80.17],HYD:[17.23,78.43],CCU:[22.65,88.45],
  COK:[10.15,76.39],GOI:[15.38,73.83],AMD:[23.07,72.63],
  PNQ:[18.58,73.92],GAU:[26.11,91.59],
  CMB:[7.18,79.88],MLE:[4.19,73.53],KTM:[27.70,85.36],
  ISB:[33.62,73.10],KHI:[24.91,67.16],LHE:[31.52,74.40],
  DAC:[23.84,90.40],
  PEK:[40.08,116.58],PVG:[31.14,121.81],SHA:[31.20,121.34],
  CAN:[23.39,113.30],SZX:[22.64,113.81],HKG:[22.31,113.91],
  CTU:[30.58,103.95],CKG:[29.72,106.64],XIY:[34.45,108.75],
  NKG:[31.74,118.86],HGH:[30.23,120.43],XMN:[24.54,118.13],
  WUH:[30.78,114.21],TAO:[36.27,120.37],DLC:[38.97,121.54],
  TSN:[39.12,117.35],KMG:[24.99,102.74],
  NRT:[35.76,140.39],HND:[35.55,139.78],KIX:[34.43,135.24],
  NGO:[34.86,136.81],FUK:[33.59,130.45],CTS:[42.77,141.69],
  ITM:[34.79,135.44],OKA:[26.20,127.65],
  ICN:[37.46,126.44],GMP:[37.56,126.79],PUS:[35.18,128.94],CJU:[33.51,126.49],
  TPE:[25.08,121.23],KHH:[22.58,120.35],
  MFM:[22.15,113.59],
  SIN:[1.36,103.99],KUL:[2.75,101.71],PEN:[5.30,100.28],
  BKK:[13.69,100.75],DMK:[13.91,100.61],CNX:[18.77,98.96],HKT:[8.11,98.32],USM:[9.55,100.06],
  SGN:[10.82,106.65],HAN:[21.22,105.81],DAD:[16.04,108.20],
  CGK:[-6.13,106.66],DPS:[-8.75,115.17],SUB:[-7.38,112.79],
  MNL:[14.51,121.02],CEB:[10.31,123.98],
  RGN:[16.91,96.13],REP:[13.41,107.86],PNH:[11.55,104.84],
  VTE:[17.99,102.56],LPQ:[19.90,102.16],
  SYD:[-33.95,151.18],MEL:[-37.67,144.84],BNE:[-27.38,153.12],
  PER:[-31.94,115.97],ADL:[-34.94,138.53],CBR:[-35.31,149.19],
  OOL:[-28.16,153.51],CNS:[-16.89,145.76],DRW:[-12.41,130.87],
  AKL:[-37.01,174.79],WLG:[-41.33,174.81],CHC:[-43.49,172.53],
  ZQN:[-45.02,168.74],
  NAN:[-17.76,177.44],SUV:[-18.04,178.56],
  PPT:[-17.56,-149.61],NOU:[-22.01,166.21],APW:[-13.83,-171.99],
  RAR:[-21.20,-159.81],
  TAS:[41.26,69.28],ALA:[43.35,77.04],NQZ:[51.02,71.47],
  TBS:[41.67,44.95],EVN:[40.15,44.40],GYD:[40.47,50.05],
  ASB:[37.99,58.36],
};

/* ── Airport Timezones (IANA) ─────────────────────────── */
const TZ = {
  // US East
  JFK:"America/New_York",EWR:"America/New_York",LGA:"America/New_York",BOS:"America/New_York",
  PHL:"America/New_York",DCA:"America/New_York",IAD:"America/New_York",BWI:"America/New_York",
  CLT:"America/New_York",RDU:"America/New_York",PIT:"America/New_York",BUF:"America/New_York",
  ROC:"America/New_York",SYR:"America/New_York",ALB:"America/New_York",RIC:"America/New_York",
  ORF:"America/New_York",CHS:"America/New_York",SAV:"America/New_York",MIA:"America/New_York",
  FLL:"America/New_York",PBI:"America/New_York",MCO:"America/New_York",TPA:"America/New_York",
  JAX:"America/New_York",RSW:"America/New_York",ATL:"America/New_York",PVD:"America/New_York",
  BDL:"America/New_York",PWM:"America/New_York",BTV:"America/New_York",MHT:"America/New_York",
  SDF:"America/New_York",LEX:"America/New_York",CVG:"America/New_York",CMH:"America/New_York",
  CLE:"America/New_York",DTW:"America/New_York",IND:"America/New_York",
  // US Central
  ORD:"America/Chicago",MDW:"America/Chicago",MSP:"America/Chicago",DFW:"America/Chicago",
  DAL:"America/Chicago",IAH:"America/Chicago",HOU:"America/Chicago",AUS:"America/Chicago",
  SAT:"America/Chicago",MSY:"America/Chicago",BNA:"America/Chicago",MEM:"America/Chicago",
  STL:"America/Chicago",MCI:"America/Chicago",MKE:"America/Chicago",MSN:"America/Chicago",
  OMA:"America/Chicago",DSM:"America/Chicago",OKC:"America/Chicago",TUL:"America/Chicago",
  // US Mountain
  DEN:"America/Denver",COS:"America/Denver",SLC:"America/Denver",ABQ:"America/Denver",
  ELP:"America/Denver",BOI:"America/Boise",
  // US Pacific
  LAX:"America/Los_Angeles",SFO:"America/Los_Angeles",SJC:"America/Los_Angeles",OAK:"America/Los_Angeles",
  SEA:"America/Los_Angeles",PDX:"America/Los_Angeles",SAN:"America/Los_Angeles",LAS:"America/Los_Angeles",
  PHX:"America/Phoenix",TUS:"America/Phoenix",RNO:"America/Los_Angeles",
  PSP:"America/Los_Angeles",SNA:"America/Los_Angeles",BUR:"America/Los_Angeles",ONT:"America/Los_Angeles",
  LGB:"America/Los_Angeles",SMF:"America/Los_Angeles",
  // Alaska & Hawaii
  ANC:"America/Anchorage",FAI:"America/Anchorage",
  HNL:"Pacific/Honolulu",OGG:"Pacific/Honolulu",LIH:"Pacific/Honolulu",KOA:"Pacific/Honolulu",
  // Canada
  YYZ:"America/Toronto",YUL:"America/Toronto",YOW:"America/Toronto",YHZ:"America/Halifax",
  YQB:"America/Toronto",YKF:"America/Toronto",YXU:"America/Toronto",YQM:"America/Halifax",
  YFC:"America/Halifax",YSJ:"America/Halifax",YQT:"America/Toronto",
  YWG:"America/Winnipeg",YXE:"America/Regina",YQR:"America/Regina",
  YYC:"America/Edmonton",YEG:"America/Edmonton",
  YVR:"America/Vancouver",YYJ:"America/Vancouver",YXX:"America/Vancouver",YLW:"America/Vancouver",
  // Mexico & Central America
  MEX:"America/Mexico_City",GDL:"America/Mexico_City",MTY:"America/Monterrey",MID:"America/Merida",
  CUN:"America/Cancun",CZM:"America/Cancun",SJD:"America/Mazatlan",PVR:"America/Mexico_City",
  PTY:"America/Panama",SJO:"America/Costa_Rica",LIR:"America/Costa_Rica",
  SAL:"America/El_Salvador",GUA:"America/Guatemala",BZE:"America/Belize",
  // Caribbean
  SJU:"America/Puerto_Rico",STT:"America/Virgin",STX:"America/Virgin",
  NAS:"America/Nassau",MBJ:"America/Jamaica",KIN:"America/Jamaica",
  PUJ:"America/Santo_Domingo",SDQ:"America/Santo_Domingo",
  AUA:"America/Aruba",CUR:"America/Curacao",SXM:"America/Lower_Princes",
  GCM:"America/Cayman",POS:"America/Port_of_Spain",BGI:"America/Barbados",
  // South America
  BOG:"America/Bogota",MDE:"America/Bogota",CLO:"America/Bogota",CTG:"America/Bogota",
  LIM:"America/Lima",CUZ:"America/Lima",
  GRU:"America/Sao_Paulo",GIG:"America/Sao_Paulo",BSB:"America/Sao_Paulo",
  CNF:"America/Sao_Paulo",REC:"America/Recife",SSA:"America/Bahia",
  SCL:"America/Santiago",EZE:"America/Argentina/Buenos_Aires",AEP:"America/Argentina/Buenos_Aires",
  MVD:"America/Montevideo",ASU:"America/Asuncion",VVI:"America/La_Paz",
  UIO:"America/Guayaquil",GYE:"America/Guayaquil",CCS:"America/Caracas",
  // UK & Ireland
  LHR:"Europe/London",LGW:"Europe/London",STN:"Europe/London",LTN:"Europe/London",
  MAN:"Europe/London",BHX:"Europe/London",EDI:"Europe/London",GLA:"Europe/London",
  BRS:"Europe/London",LPL:"Europe/London",NCL:"Europe/London",BFS:"Europe/London",BHD:"Europe/London",
  DUB:"Europe/Dublin",SNN:"Europe/Dublin",ORK:"Europe/Dublin",KNO:"Europe/Dublin",
  // France
  CDG:"Europe/Paris",ORY:"Europe/Paris",NCE:"Europe/Paris",LYS:"Europe/Paris",
  MRS:"Europe/Paris",TLS:"Europe/Paris",BOD:"Europe/Paris",NTE:"Europe/Paris",
  // Benelux & Germany
  AMS:"Europe/Amsterdam",EIN:"Europe/Amsterdam",RTM:"Europe/Amsterdam",
  BRU:"Europe/Brussels",LUX:"Europe/Luxembourg",
  FRA:"Europe/Berlin",MUC:"Europe/Berlin",BER:"Europe/Berlin",DUS:"Europe/Berlin",
  HAM:"Europe/Berlin",CGN:"Europe/Berlin",STR:"Europe/Berlin",HAJ:"Europe/Berlin",
  NUE:"Europe/Berlin",LEJ:"Europe/Berlin",DRS:"Europe/Berlin",
  // Switzerland & Austria
  ZRH:"Europe/Zurich",GVA:"Europe/Zurich",BSL:"Europe/Zurich",
  VIE:"Europe/Vienna",SZG:"Europe/Vienna",INN:"Europe/Vienna",
  // Iberia
  BCN:"Europe/Madrid",MAD:"Europe/Madrid",PMI:"Europe/Madrid",AGP:"Europe/Madrid",
  ALC:"Europe/Madrid",VLC:"Europe/Madrid",IBZ:"Europe/Madrid",SVQ:"Europe/Madrid",
  BIO:"Europe/Madrid",SCQ:"Europe/Madrid",
  LIS:"Europe/Lisbon",OPO:"Europe/Lisbon",FAO:"Europe/Lisbon",FNC:"Atlantic/Madeira",
  // Italy
  FCO:"Europe/Rome",MXP:"Europe/Rome",LIN:"Europe/Rome",VCE:"Europe/Rome",
  NAP:"Europe/Rome",BLQ:"Europe/Rome",FLR:"Europe/Rome",PSA:"Europe/Rome",
  CTA:"Europe/Rome",PMO:"Europe/Rome",OLB:"Europe/Rome",CAG:"Europe/Rome",BRI:"Europe/Rome",
  // Greece
  ATH:"Europe/Athens",SKG:"Europe/Athens",HER:"Europe/Athens",JMK:"Europe/Athens",
  JTR:"Europe/Athens",CFU:"Europe/Athens",RHO:"Europe/Athens",
  // Nordics & Baltics
  CPH:"Europe/Copenhagen",OSL:"Europe/Oslo",BGO:"Europe/Oslo",
  ARN:"Europe/Stockholm",GOT:"Europe/Stockholm",HEL:"Europe/Helsinki",
  VNO:"Europe/Vilnius",RIX:"Europe/Riga",TLL:"Europe/Tallinn",
  // Central & Eastern Europe
  WAW:"Europe/Warsaw",KRK:"Europe/Warsaw",WRO:"Europe/Warsaw",GDN:"Europe/Warsaw",
  PRG:"Europe/Prague",BTS:"Europe/Bratislava",BUD:"Europe/Budapest",
  OTP:"Europe/Bucharest",CLJ:"Europe/Bucharest",SOF:"Europe/Sofia",
  ZAG:"Europe/Zagreb",SPU:"Europe/Zagreb",DBV:"Europe/Zagreb",
  BEG:"Europe/Belgrade",LJU:"Europe/Ljubljana",TIV:"Europe/Podgorica",KIV:"Europe/Chisinau",
  // Turkey
  IST:"Europe/Istanbul",SAW:"Europe/Istanbul",AYT:"Europe/Istanbul",ADB:"Europe/Istanbul",
  ESB:"Europe/Istanbul",DLM:"Europe/Istanbul",BJV:"Europe/Istanbul",
  // Middle East
  DXB:"Asia/Dubai",AUH:"Asia/Dubai",SHJ:"Asia/Dubai",
  DOH:"Asia/Qatar",BAH:"Asia/Bahrain",KWI:"Asia/Kuwait",
  MCT:"Asia/Muscat",RUH:"Asia/Riyadh",JED:"Asia/Riyadh",MED:"Asia/Riyadh",DMM:"Asia/Riyadh",
  TLV:"Asia/Jerusalem",AMM:"Asia/Amman",BEY:"Asia/Beirut",
  // Africa
  CAI:"Africa/Cairo",HRG:"Africa/Cairo",SSH:"Africa/Cairo",
  CMN:"Africa/Casablanca",RAK:"Africa/Casablanca",TNG:"Africa/Casablanca",FEZ:"Africa/Casablanca",
  ALG:"Africa/Algiers",TUN:"Africa/Tunis",
  NBO:"Africa/Nairobi",MBA:"Africa/Nairobi",DAR:"Africa/Dar_es_Salaam",ZNZ:"Africa/Dar_es_Salaam",
  KGL:"Africa/Kigali",EBB:"Africa/Kampala",ADD:"Africa/Addis_Ababa",
  JNB:"Africa/Johannesburg",CPT:"Africa/Johannesburg",DUR:"Africa/Johannesburg",
  WDH:"Africa/Windhoek",GBE:"Africa/Gaborone",HRE:"Africa/Harare",
  LOS:"Africa/Lagos",ABV:"Africa/Lagos",ACC:"Africa/Accra",DSS:"Africa/Dakar",ABJ:"Africa/Abidjan",
  MS:"Africa/Cairo",
  // South Asia
  DEL:"Asia/Kolkata",BOM:"Asia/Kolkata",BLR:"Asia/Kolkata",MAA:"Asia/Kolkata",
  HYD:"Asia/Kolkata",CCU:"Asia/Kolkata",COK:"Asia/Kolkata",GOI:"Asia/Kolkata",
  AMD:"Asia/Kolkata",PNQ:"Asia/Kolkata",GAU:"Asia/Kolkata",
  CMB:"Asia/Colombo",MLE:"Indian/Maldives",KTM:"Asia/Kathmandu",
  ISB:"Asia/Karachi",KHI:"Asia/Karachi",LHE:"Asia/Karachi",DAC:"Asia/Dhaka",
  // East Asia
  PEK:"Asia/Shanghai",PVG:"Asia/Shanghai",SHA:"Asia/Shanghai",CAN:"Asia/Shanghai",
  SZX:"Asia/Shanghai",CTU:"Asia/Shanghai",CKG:"Asia/Shanghai",XIY:"Asia/Shanghai",
  NKG:"Asia/Shanghai",HGH:"Asia/Shanghai",XMN:"Asia/Shanghai",WUH:"Asia/Shanghai",
  TAO:"Asia/Shanghai",DLC:"Asia/Shanghai",TSN:"Asia/Shanghai",KMG:"Asia/Shanghai",
  HKG:"Asia/Hong_Kong",MFM:"Asia/Macau",
  NRT:"Asia/Tokyo",HND:"Asia/Tokyo",KIX:"Asia/Tokyo",NGO:"Asia/Tokyo",
  FUK:"Asia/Tokyo",CTS:"Asia/Tokyo",ITM:"Asia/Tokyo",OKA:"Asia/Tokyo",
  ICN:"Asia/Seoul",GMP:"Asia/Seoul",PUS:"Asia/Seoul",CJU:"Asia/Seoul",
  TPE:"Asia/Taipei",KHH:"Asia/Taipei",
  // Southeast Asia
  SIN:"Asia/Singapore",KUL:"Asia/Kuala_Lumpur",PEN:"Asia/Kuala_Lumpur",
  BKK:"Asia/Bangkok",DMK:"Asia/Bangkok",CNX:"Asia/Bangkok",HKT:"Asia/Bangkok",USM:"Asia/Bangkok",
  SGN:"Asia/Ho_Chi_Minh",HAN:"Asia/Ho_Chi_Minh",DAD:"Asia/Ho_Chi_Minh",
  CGK:"Asia/Jakarta",DPS:"Asia/Makassar",SUB:"Asia/Jakarta",
  MNL:"Asia/Manila",CEB:"Asia/Manila",
  RGN:"Asia/Yangon",REP:"Asia/Phnom_Penh",PNH:"Asia/Phnom_Penh",
  VTE:"Asia/Vientiane",LPQ:"Asia/Vientiane",
  // Oceania
  SYD:"Australia/Sydney",MEL:"Australia/Melbourne",BNE:"Australia/Brisbane",
  PER:"Australia/Perth",ADL:"Australia/Adelaide",CBR:"Australia/Sydney",
  OOL:"Australia/Brisbane",CNS:"Australia/Brisbane",DRW:"Australia/Darwin",
  AKL:"Pacific/Auckland",WLG:"Pacific/Auckland",CHC:"Pacific/Auckland",ZQN:"Pacific/Auckland",
  NAN:"Pacific/Fiji",SUV:"Pacific/Fiji",PPT:"Pacific/Tahiti",
  NOU:"Pacific/Noumea",APW:"Pacific/Apia",RAR:"Pacific/Rarotonga",
  // Central Asia
  TAS:"Asia/Tashkent",ALA:"Asia/Almaty",NQZ:"Asia/Almaty",
  TBS:"Asia/Tbilisi",EVN:"Asia/Yerevan",GYD:"Asia/Baku",ASB:"Asia/Ashgabat",
  // Russia
  SU:"Europe/Moscow",S7:"Asia/Novosibirsk",
};

const tzAbbr = (airportCode, date) => {
  const tz = TZ[(airportCode || "").toUpperCase()];
  if (!tz) return "";
  try {
    const d = date ? new Date(date + "T12:00:00") : new Date();
    return new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(d)
      .find(p => p.type === "timeZoneName")?.value || "";
  } catch { return ""; }
};

const getDist = (a,b) => {
  const c1=AP[a?.toUpperCase()],c2=AP[b?.toUpperCase()];
  if(!c1||!c2) return null;
  const R=3959,dLat=(c2[0]-c1[0])*Math.PI/180,dLon=(c2[1]-c1[1])*Math.PI/180;
  const la=c1[0]*Math.PI/180,lb=c2[0]*Math.PI/180;
  const x=Math.sin(dLat/2)**2+Math.cos(la)*Math.cos(lb)*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)));
};

const airlineName = (c) => { if(!c) return ""; return AIRLINES[c.replace(/[0-9]/g,"").toUpperCase()]||c; };
const fmtDate = (d) => { if(!d) return ""; return new Date(d+"T00:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"}); };
const fmtShort = (d) => { if(!d) return ""; return new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
const fmtCur = (n) => { if(!n&&n!==0) return "--"; return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n); };
const daysTo = (d) => { if(!d) return null; const t=new Date();t.setHours(0,0,0,0); return Math.ceil((new Date(d+"T00:00:00")-t)/(864e5)); };
const comma = (n) => n?.toLocaleString()??"--";

const gcalURL = (f,mem) => {
  const fmt=(d,t)=>(d||"").replace(/-/g,"")+"T"+((t||"00:00").replace(/:/g,""))+"00";
  const who=(f.travelers||[]).map(id=>mem.find(m=>m.id===id)?.name).filter(Boolean).join(", ");
  const t=encodeURIComponent(`${f.flightNumber||"Flight"} ${f.departureAirport||""}>${f.arrivalAirport||""}${who?` (${who})`:""}`);
  const det=encodeURIComponent(`Airline: ${airlineName(f.flightNumber)||f.airline||""}\nFlight: ${f.flightNumber||""}\nConf: ${f.confirmationCode||""}\nCost: ${fmtCur(f.cost)}\nTravelers: ${who}\nMiles: ${comma(f.miles)}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${t}&dates=${fmt(f.departureDate,f.departureTime)}/${fmt(f.arrivalDate||f.departureDate,f.arrivalTime||f.departureTime)}&details=${det}&location=${encodeURIComponent((f.departureAirport||"")+" Airport")}`;
};

const dlICS = (f,mem) => {
  const fmt=(d,t)=>(d||"").replace(/-/g,"")+"T"+((t||"0000").replace(/:/g,""))+"00Z";
  const who=(f.travelers||[]).map(id=>mem.find(m=>m.id===id)?.name).filter(Boolean).join(", ");
  const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(f.departureDate,f.departureTime)}\nDTEND:${fmt(f.arrivalDate||f.departureDate,f.arrivalTime||f.departureTime)}\nSUMMARY:${f.flightNumber||"Flight"} ${f.departureAirport||""}>${f.arrivalAirport||""}\nDESCRIPTION:${who}\nEND:VEVENT\nEND:VCALENDAR`;
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));a.download=`${f.flightNumber||"flight"}.ics`;a.click();
};

const EMPTY = {airline:"",flightNumber:"",departureAirport:"",arrivalAirport:"",departureDate:"",departureTime:"",arrivalDate:"",arrivalTime:"",departureTerminal:"",arrivalTerminal:"",cost:"",miles:"",confirmationCode:"",notes:"",status:"upcoming",travelers:["me"],tripName:""};
const DEF_MEM = [{id:"me",name:"Me",relationship:"self",color:C.accent}];
const RELS = ["self","spouse","parent","in-law","sibling","child","other"];
const REL_COL = {self:C.accent,spouse:C.olive,parent:C.navy,"in-law":C.sand,sibling:"#7B6B8D",child:"#6B8D7B",other:C.textMuted};
const ST_MAP = {upcoming:{bg:C.oliveSoft,text:C.olive,label:"Upcoming"},completed:{bg:C.sandSoft,text:"#96783C",label:"Completed"},cancelled:{bg:"rgba(155,48,34,0.10)",text:C.danger,label:"Cancelled"}};
const MO=["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ── SVG Icons ──────────────────────────────────────── */
const PlaneIcon = ({size=20,color=C.text,style={}}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>;
const SunBurst = ({size=24,color=C.accent}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2"><circle cx="12" cy="12" r="3.5"/>{[0,45,90,135,180,225,270,315].map((a,i)=>{const r1=6,r2=9.5,rad=a*Math.PI/180;return <line key={i} x1={12+r1*Math.cos(rad)} y1={12+r1*Math.sin(rad)} x2={12+r2*Math.cos(rad)} y2={12+r2*Math.sin(rad)}/>;})}</svg>;
const CompassRose = ({size=20,color=C.textMuted}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><path d="M12 8l2 4-2 4-2-4z" fill={color} opacity="0.2" stroke="none"/></svg>;
const CalIcon = ({size=14,color="currentColor"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const DollarIcon = ({size=15,color=C.sand}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;

/* ══════════════════════════════════════════════════════════
   ALL COMPONENTS AT MODULE LEVEL (fixes typing/focus bug)
   ══════════════════════════════════════════════════════════ */

/* ── FormField ──────────────────────────────────────── */
function FormField({label, value, onChange, type="text", placeholder="", half=false}) {
  return (
    <div style={{flex:half?"1 1 calc(50% - 5px)":"1 1 100%",minWidth:half?125:"auto"}}>
      <label style={{fontSize:9,color:C.textDim,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:2,display:"block",fontFamily:"'Fraunces',serif"}}>{label}</label>
      <input type={type} value={value||""} onChange={onChange} placeholder={placeholder} step={type==="number"?"0.01":undefined}/>
    </div>
  );
}

/* ── TripNameField (autocomplete) ────────────────────── */
function TripNameField({ value, onChange, tripNames }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const matches = (value || "").length > 0
    ? tripNames.filter(n => n.toLowerCase().includes(value.toLowerCase()) && n !== value)
    : tripNames;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ flex: "1 1 100%", position: "relative" }}>
      <label style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2, display: "block", fontFamily: "'Fraunces',serif" }}>Trip Name</label>
      <input
        value={value || ""}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Geneva June 2026"
      />
      {open && matches.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, marginTop: 4, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(42,37,32,0.12)", maxHeight: 160, overflowY: "auto" }}>
          {matches.map(n => (
            <div
              key={n}
              onClick={() => { onChange(n); setOpen(false); }}
              style={{ padding: "8px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.bgWarm}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 9, color: C.navy, background: C.navySoft, padding: "2px 6px", borderRadius: 6, fontWeight: 600, fontFamily: "'Fraunces',serif" }}>trip</span>
              {n}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── NavTab ──────────────────────────────────────────── */
function NavTab({icon:I,label,id,ci,active,onNav}) {
  return (
    <button onClick={()=>onNav(id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 12px",background:"none",border:"none",cursor:"pointer",color:active?C.accent:C.textMuted,fontSize:9,fontWeight:600,fontFamily:"'Fraunces',serif",borderBottom:active?`2px solid ${C.accent}`:"2px solid transparent",transition:"all 0.2s"}}>
      {ci||<I size={17}/>}<span>{label}</span>
    </button>
  );
}

/* ── Stat Card ──────────────────────────────────────── */
function Stat({icon,label,value,sub,color=C.accent}) {
  return (
    <div className="stat-card" style={{background:C.bgCard,borderRadius:14,padding:16,border:`1px solid ${C.border}`,flex:"1 1 170px",minWidth:145}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
        <div style={{background:`${color}12`,borderRadius:8,padding:6,display:"flex"}}>{icon}</div>
        <span style={{color:C.textMuted,fontSize:9,fontWeight:700,fontFamily:"'Fraunces',serif",letterSpacing:"0.8px",textTransform:"uppercase"}}>{label}</span>
      </div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:C.textMuted,marginTop:4}}>{sub}</div>}
    </div>
  );
}

/* ── Tag ────────────────────────────────────────────── */
function Tag({ m, sel, onClick, onRm }) {
  return (
    <span className={`tg ${sel ? "ts" : ""}`} onClick={onClick} style={{ background: `${m.color}12`, color: m.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, display: "inline-block" }} />
      {m.name}
      {onRm && m.id !== "me" && (
        <X size={10} onClick={(e) => { e.stopPropagation(); onRm(); }} style={{ cursor: "pointer", marginLeft: 1 }} />
      )}
    </span>
  );
}

/* ── Globe Map ──────────────────────────────────────── */
function GlobeMap({flights}) {
  const W=700,H=380;
  const proj=([lat,lon])=>[((lon+180)/360)*W,((90-lat)/180)*H];
  const arcs=flights.filter(f=>AP[f.departureAirport?.toUpperCase()]&&AP[f.arrivalAirport?.toUpperCase()]).map(f=>{
    const from=proj(AP[f.departureAirport.toUpperCase()]),to=proj(AP[f.arrivalAirport.toUpperCase()]);
    const mx=(from[0]+to[0])/2,my=(from[1]+to[1])/2,dist=Math.sqrt((to[0]-from[0])**2+(to[1]-from[1])**2);
    return {from,to,path:`M${from[0]},${from[1]} Q${mx},${my-Math.min(dist*0.3,60)} ${to[0]},${to[1]}`,f};
  });
  const dots={};
  flights.forEach(f=>{[f.departureAirport,f.arrivalAirport].forEach(c=>{if(c&&AP[c.toUpperCase()]&&!dots[c.toUpperCase()]) dots[c.toUpperCase()]=proj(AP[c.toUpperCase()])})});
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      <defs><pattern id="mg" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M 35 0 L 0 0 0 35" fill="none" stroke={C.border} strokeWidth="0.4" opacity="0.6"/></pattern></defs>
      <rect width={W} height={H} fill={C.bgWarm}/><rect width={W} height={H} fill="url(#mg)"/>
      <g opacity="0.12" fill={C.textMuted}><ellipse cx="175" cy="125" rx="78" ry="58"/><ellipse cx="208" cy="248" rx="38" ry="62"/><ellipse cx="358" cy="98" rx="32" ry="28"/><ellipse cx="368" cy="205" rx="33" ry="52"/><ellipse cx="488" cy="118" rx="72" ry="48"/><ellipse cx="558" cy="268" rx="28" ry="18"/></g>
      {arcs.map((a,i)=><g key={i}><path d={a.path} fill="none" stroke={C.accent} strokeWidth="1.5" opacity="0.35" strokeDasharray="4 3"/><path d={a.path} fill="none" stroke={C.accent} strokeWidth="2" opacity="0.7" strokeDasharray={`${8+i*3} 300`}/></g>)}
      {Object.entries(dots).map(([code,[x,y]])=><g key={code}><circle cx={x} cy={y} r="4.5" fill={C.bgCard} stroke={C.accent} strokeWidth="1.5"/><circle cx={x} cy={y} r="1.5" fill={C.accent}/><text x={x} y={y-8} textAnchor="middle" fill={C.text} fontSize="7.5" fontFamily="'JetBrains Mono',monospace" fontWeight="600">{code}</text></g>)}
      <g transform="translate(648,340)"><circle r="17" fill={C.bgCard} stroke={C.border} strokeWidth="0.8"/><text textAnchor="middle" y="-7" fontSize="6.5" fill={C.textMuted} fontWeight="700" fontFamily="'Fraunces',serif">N</text><line x1="0" y1="-4" x2="0" y2="4" stroke={C.accent} strokeWidth="0.8"/><line x1="-4" y1="0" x2="4" y2="0" stroke={C.textDim} strokeWidth="0.4"/></g>
    </svg>
  );
}

/* ── FlightCard ─────────────────────────────────────── */
/* ── Live Status Styles ──────────────────────────────── */
const LS_MAP = {
  "on-time":{bg:C.oliveSoft,text:C.olive,label:"On Time"},
  "delayed":{bg:"rgba(199,91,42,0.10)",text:C.accent,label:"Delayed"},
  "cancelled":{bg:"rgba(155,48,34,0.10)",text:C.danger,label:"Cancelled"},
  "in-flight":{bg:C.navySoft,text:C.navy,label:"In Flight"},
  "landed":{bg:C.oliveSoft,text:C.olive,label:"Landed"},
  "diverted":{bg:"rgba(155,48,34,0.10)",text:C.danger,label:"Diverted"},
  "unknown":{bg:C.sandSoft,text:"#96783C",label:"Unknown"},
};

const fmtAgo = (iso) => {
  if (!iso) return "";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

function FlightCard({ f, i = 0, members, onOpenDetail, liveStatus, refreshingId, onRefresh }) {
  const d = daysTo(f.departureDate);
  const sc = ST_MAP[f.status] || ST_MAP.upcoming;
  const tv = (f.travelers || []).map((id) => members.find((m) => m.id === id)).filter(Boolean);
  const ls = liveStatus?.[f.id];
  const isRefreshing = refreshingId === f.id;
  const canRefresh = f.status === "upcoming" && f.flightNumber && !isRefreshing &&
    (!ls?.refreshedAt || (Date.now() - new Date(ls.refreshedAt).getTime()) >= COOLDOWN_MS);
  const cooldownLeft = ls?.refreshedAt ? Math.max(0, Math.ceil((COOLDOWN_MS - (Date.now() - new Date(ls.refreshedAt).getTime())) / 60000)) : 0;
  const lsBadge = ls ? (LS_MAP[ls.flightStatus] || LS_MAP.unknown) : null;

  return (
    <div className="fc card-hover" onClick={() => onOpenDetail(f)} style={{ background: C.bgCard, borderRadius: 14, cursor: "pointer", border: `1px solid ${C.border}`, overflow: "hidden", animationDelay: `${i * 0.05}s` }}>
      <div style={{ height: 2, background: ls?.flightStatus === "delayed" ? C.accent : ls?.flightStatus === "cancelled" ? C.danger : C.accent, opacity: 0.5 }} />
      <div style={{ padding: "13px 16px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div style={{ flex: "1 1 auto", minWidth: 170 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>{f.departureAirport || "???"}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 14, height: 1, background: C.textDim }} />
              <PlaneIcon size={14} color={C.accent} />
              <div style={{ width: 14, height: 1, background: C.textDim }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>{f.arrivalAirport || "???"}</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>{fmtDate(f.departureDate)}</span>
            {f.departureTime && <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{f.departureTime}{tzAbbr(f.departureAirport, f.departureDate) ? ` ${tzAbbr(f.departureAirport, f.departureDate)}` : ""}{f.arrivalTime ? ` — ${f.arrivalTime}${tzAbbr(f.arrivalAirport, f.arrivalDate || f.departureDate) ? ` ${tzAbbr(f.arrivalAirport, f.arrivalDate || f.departureDate)}` : ""}` : ""}</span>}
          </div>
          {/* Live status row */}
          {ls && (
            <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
              {lsBadge && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: lsBadge.bg, color: lsBadge.text, fontFamily: "'Fraunces',serif", textTransform: "uppercase" }}>{lsBadge.label}</span>}
              {ls.departureDelay > 0 && <span style={{ fontSize: 10, color: C.accent, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>+{ls.departureDelay}min</span>}
              {ls.departureGate && <span style={{ fontSize: 10, color: C.navy, fontWeight: 600 }}>Gate {ls.departureGate}</span>}
              {ls.arrivalGate && <span style={{ fontSize: 10, color: C.navy, fontWeight: 600 }}>→ Gate {ls.arrivalGate}</span>}
              <span style={{ fontSize: 9, color: C.textDim }}>{fmtAgo(ls.refreshedAt)}</span>
            </div>
          )}
          {tv.length > 0 && <div style={{ display: "flex", gap: 3, marginTop: 5, flexWrap: "wrap" }}>{tv.map((m) => <span key={m.id} style={{ fontSize: 9, color: m.color, background: `${m.color}10`, padding: "1px 7px", borderRadius: 8, fontWeight: 600 }}>{m.name}</span>)}</div>}
          {f.tripName && <div style={{ marginTop: 4 }}><span style={{ fontSize: 9, color: C.navy, background: C.navySoft, padding: "2px 8px", borderRadius: 8, fontWeight: 600, fontFamily: "'Fraunces',serif" }}>{f.tripName}</span></div>}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          {f.flightNumber && <div style={{ textAlign: "center" }}><div style={{ fontSize: 8, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Flight</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: C.navy }}>{f.flightNumber}</div></div>}
          {f.miles && <div style={{ textAlign: "center" }}><div style={{ fontSize: 8, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Miles</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: C.olive }}>{comma(f.miles)}</div></div>}
          {f.cost != null && f.cost !== "" && <div style={{ textAlign: "center" }}><div style={{ fontSize: 8, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Cost</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: C.accent }}>{fmtCur(f.cost)}</div></div>}
          <span style={{ background: sc.bg, color: sc.text, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 14, fontFamily: "'Fraunces',serif", textTransform: "uppercase" }}>{sc.label}</span>
          {d != null && d >= 0 && f.status === "upcoming" && <span style={{ background: d <= 3 ? "rgba(155,48,34,0.10)" : C.accentSoft, color: d <= 3 ? C.danger : C.accent, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 14, fontFamily: "'JetBrains Mono',monospace" }}>{d === 0 ? "TODAY" : d === 1 ? "TMW" : `${d}d`}</span>}
          {f.status === "upcoming" && f.flightNumber && (
            <button
              title={!canRefresh && cooldownLeft > 0 ? `Wait ${cooldownLeft}m` : "Refresh status"}
              onClick={(e) => { e.stopPropagation(); if (canRefresh && onRefresh) onRefresh(f); }}
              disabled={!canRefresh}
              style={{
                background: "none", border: `1px solid ${canRefresh ? C.border : "transparent"}`,
                borderRadius: 8, padding: 5, cursor: canRefresh ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: canRefresh ? 1 : 0.35, transition: "all 0.2s",
              }}
            >
              <RefreshCw size={13} color={C.textMuted} style={isRefreshing ? { animation: "spin 1s linear infinite" } : {}} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── MemFilterBar ───────────────────────────────────── */
function MemFilterBar({ members, filterM, setFilterM }) {
  if (members.length <= 1) return null;
  return (
    <div>
      <div style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontFamily: "'Fraunces',serif" }}>Filter by traveler</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        <span className={`tg ${!filterM ? "ts" : ""}`} onClick={() => setFilterM(null)} style={{ background: !filterM ? `${C.accent}15` : C.bgInput, color: !filterM ? C.accent : C.textMuted }}>All</span>
        {members.map((m) => <Tag key={m.id} m={m} sel={filterM === m.id} onClick={() => setFilterM(filterM === m.id ? null : m.id)} />)}
      </div>
    </div>
  );
}

/* ── FlightsView ────────────────────────────────────── */
/* ── Trip Group Card ─────────────────────────────────── */
function TripGroup({ tripName, flights, members, onOpenDetail, liveStatus, refreshingId, onRefresh }) {
  const sorted = [...flights].sort((a, b) => (a.departureDate || "").localeCompare(b.departureDate || ""));
  const first = sorted[0], last = sorted[sorted.length - 1];
  const totalCost = flights.reduce((s, f) => s + (parseFloat(f.cost) || 0), 0);
  const totalMiles = flights.reduce((s, f) => s + (parseInt(f.miles) || 0), 0);
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: expanded ? `1px solid ${C.border}` : "none" }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 700, color: C.text }}>{tripName}</span>
            <span style={{ fontSize: 9, color: C.navy, background: C.navySoft, padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>{flights.length} {flights.length === 1 ? "leg" : "legs"}</span>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.textMuted }}>
            <span>{fmtShort(first?.departureDate)} — {fmtShort(last?.arrivalDate || last?.departureDate)}</span>
            <span>{first?.departureAirport} → {last?.arrivalAirport}</span>
            {totalCost > 0 && <span>{fmtCur(totalCost)}</span>}
            {totalMiles > 0 && <span>{comma(totalMiles)} mi</span>}
          </div>
        </div>
        <ChevronRight size={16} color={C.textDim} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
      </div>
      {expanded && (
        <div style={{ padding: "8px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
          {sorted.map((f, i) => <FlightCard key={f.id} f={f} i={i} members={members} onOpenDetail={onOpenDetail} liveStatus={liveStatus} refreshingId={refreshingId} onRefresh={onRefresh} />)}
        </div>
      )}
    </div>
  );
}

function FlightsView({ search, setSearch, filtered, applyMF, members, filterM, setFilterM, onOpenDetail, onAdd, liveStatus, refreshingId, onRefresh }) {
  const displayFlights = applyMF(filtered);

  // Group by tripName
  const { trips, ungrouped } = useMemo(() => {
    const tripMap = {};
    const ungrouped = [];
    displayFlights.forEach(f => {
      if (f.tripName) {
        if (!tripMap[f.tripName]) tripMap[f.tripName] = [];
        tripMap[f.tripName].push(f);
      } else {
        ungrouped.push(f);
      }
    });
    // Sort trips by earliest departure date
    const trips = Object.entries(tripMap)
      .map(([name, flights]) => ({ name, flights }))
      .sort((a, b) => (a.flights[0]?.departureDate || "").localeCompare(b.flights[0]?.departureDate || ""));
    return { trips, ungrouped };
  }, [displayFlights]);

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800 }}>All Flights</h1>
        <button className="bp" onClick={onAdd}><Plus size={14} /> Add</button>
      </div>
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textDim }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search flights..." style={{ paddingLeft: 32 }} />
      </div>
      <MemFilterBar members={members} filterM={filterM} setFilterM={setFilterM} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {trips.map(t => <TripGroup key={t.name} tripName={t.name} flights={t.flights} members={members} onOpenDetail={onOpenDetail} liveStatus={liveStatus} refreshingId={refreshingId} onRefresh={onRefresh} />)}
        {ungrouped.map((f, i) => <FlightCard key={f.id} f={f} i={i} members={members} onOpenDetail={onOpenDetail} liveStatus={liveStatus} refreshingId={refreshingId} onRefresh={onRefresh} />)}
        {displayFlights.length === 0 && <div style={{ textAlign: "center", padding: 32, color: C.textMuted }}>{search ? "No match" : "No flights yet"}</div>}
      </div>
    </div>
  );
}

/* ── FamilyView ─────────────────────────────────────── */
function FamilyView({ showMF, setShowMF, newMem, setNewMem, addMem, members, rmMem, notif, setNotif, upcoming, members2 }) {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}><Users size={17} color={C.accent} /> Family & Settings</h1>
      <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Fraunces',serif" }}>Members</div>
          <button className="bs" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setShowMF(!showMF)}><Plus size={11} /> Add</button>
        </div>
        {showMF && (
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "end" }}>
            <div style={{ flex: "1 1 140px" }}>
              <label style={{ fontSize: 9, color: C.textDim, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 2 }}>Name</label>
              <input value={newMem.name} onChange={(e) => setNewMem((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Sarah" />
            </div>
            <div style={{ flex: "0 0 120px" }}>
              <label style={{ fontSize: 9, color: C.textDim, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 2 }}>Rel</label>
              <select value={newMem.relationship} onChange={(e) => setNewMem((p) => ({ ...p, relationship: e.target.value }))}>{RELS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
            </div>
            <button className="bp" style={{ padding: "8px 14px", fontSize: 11 }} onClick={addMem}><Check size={13} /></button>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {members.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: C.bgInput, borderRadius: 9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.color }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</span>
                <span style={{ fontSize: 10, color: C.textMuted, textTransform: "capitalize" }}>{m.relationship}</span>
              </div>
              {m.id !== "me" && <button style={{ background: "none", border: "none", cursor: "pointer", padding: 3 }} onClick={() => rmMem(m.id)}><X size={13} color={C.textDim} /></button>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16 }}>
        <div style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: "'Fraunces',serif", display: "flex", alignItems: "center", gap: 4 }}><Bell size={11} /> Notifications</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12 }}><input type="checkbox" checked={notif.enabled} onChange={(e) => setNotif((p) => ({ ...p, enabled: e.target.checked }))} style={{ width: "auto", accentColor: C.accent }} /> Enable notifications</label>
          {notif.enabled && (
            <>
              <input value={notif.email} onChange={(e) => setNotif((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" type="email" style={{ maxWidth: 280 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12 }}><input type="checkbox" checked={notif.sevenDay} onChange={(e) => setNotif((p) => ({ ...p, sevenDay: e.target.checked }))} style={{ width: "auto", accentColor: C.accent }} /> 7-day departure</label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12 }}><input type="checkbox" checked={notif.twentyFourHr} onChange={(e) => setNotif((p) => ({ ...p, twentyFourHr: e.target.checked }))} style={{ width: "auto", accentColor: C.accent }} /> 24-hour return</label>
              <p style={{ fontSize: 10, color: C.textMuted, lineHeight: 1.5, marginTop: 2 }}>Alerts appear in-app. Connect Supabase + Resend for email delivery.</p>
            </>
          )}
        </div>
      </div>
      <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16 }}>
        <div style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: "'Fraunces',serif" }}>Export</div>
        <button className="bs" onClick={() => upcoming.forEach((f) => window.open(gcalURL(f, members2), "_blank"))}><CalIcon /> Sync All to Google Cal</button>
      </div>
    </div>
  );
}

/* ── AddFlightForm ──────────────────────────────────── */
function AddFlightForm({ editing, form, uf, lookupFlight, looking, lookErr, members, togTrav, save, setView, setEditing, setForm, tripNames }) {
  const isE = !!editing;
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 580, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800 }}>{isE ? "Edit Flight" : "Add Flight"}</h1>
        <button className="bs" onClick={() => { setView("flights"); setEditing(null); setForm({ ...EMPTY }); }}><X size={13} /> Cancel</button>
      </div>
      {!isE && (
        <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16 }}>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Search size={14} color={C.accent} /> Quick Lookup</h3>
          <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>Enter a flight number and departure date, then hit lookup to auto-fill details.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}>
            <div style={{ flex: "1 1 140px" }}>
              <label style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2, display: "block", fontFamily: "'Fraunces',serif" }}>Flight #</label>
              <input value={form.flightNumber} onChange={(e) => uf("flightNumber", e.target.value)} placeholder="UA2345" />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <label style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2, display: "block", fontFamily: "'Fraunces',serif" }}>Depart Date</label>
              <input type="date" value={form.departureDate} onChange={(e) => uf("departureDate", e.target.value)} />
            </div>
            <button className="bp" style={{ padding: "9px 18px", fontSize: 12 }} onClick={lookupFlight} disabled={looking}>
              {looking ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Looking up...</> : <><RefreshCw size={14} /> Lookup</>}
            </button>
          </div>
          {lookErr && <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, padding: "7px 10px", background: "rgba(155,48,34,0.07)", borderRadius: 8 }}><AlertCircle size={13} color={C.danger} /><span style={{ fontSize: 11, color: C.danger }}>{lookErr}</span></div>}
          {form.departureAirport && form.arrivalAirport && !isE && <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, padding: "7px 10px", background: `${C.olive}08`, borderRadius: 8 }}><CheckCircle2 size={13} color={C.success} /><span style={{ fontSize: 11, color: C.success }}>Found: {form.departureAirport} &gt; {form.arrivalAirport}{form.departureTime ? ` at ${form.departureTime}` : ""}</span></div>}
        </div>
      )}
      <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <FormField label="Flight #" value={form.flightNumber} onChange={(e) => uf("flightNumber", e.target.value)} placeholder="UA2345" half />
          <FormField label="Airline" value={form.airline} onChange={(e) => uf("airline", e.target.value)} placeholder="United Airlines" half />
          <FormField label="From" value={form.departureAirport} onChange={(e) => { uf("departureAirport", e.target.value); if (e.target.value.length === 3) { const d = getDist(e.target.value.toUpperCase(), (form.arrivalAirport || "").toUpperCase()); if (d) uf("miles", d); }}} placeholder="JFK" half />
          <FormField label="To" value={form.arrivalAirport} onChange={(e) => { uf("arrivalAirport", e.target.value); if (e.target.value.length === 3) { const d = getDist((form.departureAirport || "").toUpperCase(), e.target.value.toUpperCase()); if (d) uf("miles", d); }}} placeholder="FCO" half />
          <FormField label="Depart Date" value={form.departureDate} onChange={(e) => uf("departureDate", e.target.value)} type="date" half />
          <FormField label="Depart Time" value={form.departureTime} onChange={(e) => uf("departureTime", e.target.value)} type="time" half />
          <FormField label="Arrive Date" value={form.arrivalDate} onChange={(e) => uf("arrivalDate", e.target.value)} type="date" half />
          <FormField label="Arrive Time" value={form.arrivalTime} onChange={(e) => uf("arrivalTime", e.target.value)} type="time" half />
          <FormField label="Dep Terminal" value={form.departureTerminal} onChange={(e) => uf("departureTerminal", e.target.value)} placeholder="1" half />
          <FormField label="Arr Terminal" value={form.arrivalTerminal} onChange={(e) => uf("arrivalTerminal", e.target.value)} placeholder="3" half />
          <FormField label="Cost (USD)" value={form.cost} onChange={(e) => uf("cost", e.target.value)} type="number" placeholder="425" half />
          <FormField label="Miles" value={form.miles} onChange={(e) => uf("miles", e.target.value)} type="number" placeholder="Auto" half />
          <FormField label="Confirmation" value={form.confirmationCode} onChange={(e) => uf("confirmationCode", e.target.value)} placeholder="ABC123" half />
          <div style={{ flex: "1 1 calc(50% - 5px)", minWidth: 125 }}>
            <label style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2, display: "block", fontFamily: "'Fraunces',serif" }}>Status</label>
            <select value={form.status} onChange={(e) => uf("status", e.target.value)}><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
          </div>
          <TripNameField value={form.tripName} onChange={(v) => uf("tripName", v)} tripNames={tripNames} />
          <div style={{ flex: "1 1 100%" }}>
            <label style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, display: "block", fontFamily: "'Fraunces',serif" }}>Travelers</label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{members.map((m) => <Tag key={m.id} m={m} sel={(form.travelers || []).includes(m.id)} onClick={() => togTrav(m.id)} />)}</div>
          </div>
          <div style={{ flex: "1 1 100%" }}>
            <label style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2, display: "block", fontFamily: "'Fraunces',serif" }}>Notes</label>
            <textarea value={form.notes} onChange={(e) => uf("notes", e.target.value)} placeholder="Notes..." rows={2} style={{ resize: "vertical", minHeight: 44 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
          <button className="bs" onClick={() => { setView("flights"); setEditing(null); setForm({ ...EMPTY }); }}>Cancel</button>
          <button className="bp" onClick={save} disabled={!form.departureDate && !form.flightNumber}><Check size={13} /> {isE ? "Update" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── DetailModal ────────────────────────────────────── */
function DetailModal({ f, members, onClose, onEdit, onDelete, liveStatus, refreshingId, onRefresh }) {
  const tv = (f.travelers || []).map((id) => members.find((m) => m.id === id)).filter(Boolean);
  const ls = liveStatus?.[f.id];
  const isRefreshing = refreshingId === f.id;
  const canRefresh = f.status === "upcoming" && f.flightNumber && !isRefreshing &&
    (!ls?.refreshedAt || (Date.now() - new Date(ls.refreshedAt).getTime()) >= COOLDOWN_MS);
  const cooldownLeft = ls?.refreshedAt ? Math.max(0, Math.ceil((COOLDOWN_MS - (Date.now() - new Date(ls.refreshedAt).getTime())) / 60000)) : 0;
  const lsBadge = ls ? (LS_MAP[ls.flightStatus] || LS_MAP.unknown) : null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(42,37,32,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="fade-in" onClick={(e) => e.stopPropagation()} style={{ background: C.bgCard, borderRadius: 18, maxWidth: 480, width: "100%", border: `1px solid ${C.border}`, overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ height: 3, background: C.accent }} />
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 10, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{airlineName(f.flightNumber) || f.airline || "Flight"}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 17, fontWeight: 700, color: C.navy, marginTop: 2 }}>{f.flightNumber || "--"}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer" }}><X size={18} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, background: C.bgInput, borderRadius: 14, padding: "16px 12px", marginBottom: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, fontWeight: 700 }}>{f.departureAirport || "--"}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{f.departureTime || "--"}{tzAbbr(f.departureAirport, f.departureDate) ? <span style={{ fontSize: 9, color: C.navy, marginLeft: 4 }}>{tzAbbr(f.departureAirport, f.departureDate)}</span> : ""}</div>
              {f.departureTerminal && <div style={{ fontSize: 9, color: C.textDim }}>T{f.departureTerminal}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <PlaneIcon size={16} color={C.accent} />
              <div style={{ width: 44, height: 1, background: C.border }} />
              {f.miles && <div style={{ fontSize: 9, color: C.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{comma(f.miles)} mi</div>}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, fontWeight: 700 }}>{f.arrivalAirport || "--"}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{f.arrivalTime || "--"}{tzAbbr(f.arrivalAirport, f.arrivalDate || f.departureDate) ? <span style={{ fontSize: 9, color: C.navy, marginLeft: 4 }}>{tzAbbr(f.arrivalAirport, f.arrivalDate || f.departureDate)}</span> : ""}</div>
              {f.arrivalTerminal && <div style={{ fontSize: 9, color: C.textDim }}>T{f.arrivalTerminal}</div>}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }} className="gr">
            {[{ l: "Departure", v: fmtDate(f.departureDate) }, { l: "Arrival", v: fmtDate(f.arrivalDate) }, { l: "Cost", v: fmtCur(f.cost) }, { l: "Confirmation", v: f.confirmationCode || "--" }].map((x, i) => (
              <div key={i} style={{ background: C.bgInput, borderRadius: 10, padding: 9 }}>
                <div style={{ fontSize: 8, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{x.l}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600 }}>{x.v}</div>
              </div>
            ))}
          </div>
          {tv.length > 0 && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 8, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Travelers</div><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{tv.map((m) => <Tag key={m.id} m={m} />)}</div></div>}
          {f.notes && <div style={{ background: C.bgInput, borderRadius: 10, padding: 9, marginBottom: 14 }}><div style={{ fontSize: 8, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Notes</div><div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{f.notes}</div></div>}
          {ls && (
            <div style={{ background: C.bgInput, borderRadius: 10, padding: 9, marginBottom: 14 }}>
              <div style={{ fontSize: 8, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Live Status</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {lsBadge && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: lsBadge.bg, color: lsBadge.text, fontFamily: "'Fraunces',serif", textTransform: "uppercase" }}>{lsBadge.label}</span>}
                {ls.departureDelay > 0 && <span style={{ fontSize: 11, color: C.accent, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>Dep +{ls.departureDelay}min</span>}
                {ls.arrivalDelay > 0 && <span style={{ fontSize: 11, color: C.accent, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>Arr +{ls.arrivalDelay}min</span>}
                {ls.departureGate && <span style={{ fontSize: 11, color: C.navy, fontWeight: 600 }}>Dep Gate {ls.departureGate}</span>}
                {ls.arrivalGate && <span style={{ fontSize: 11, color: C.navy, fontWeight: 600 }}>Arr Gate {ls.arrivalGate}</span>}
              </div>
              <div style={{ fontSize: 9, color: C.textDim, marginTop: 4 }}>Updated {fmtAgo(ls.refreshedAt)}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {f.status === "upcoming" && f.flightNumber && (
              <button className="bs" onClick={() => { if (canRefresh && onRefresh) onRefresh(f); }} disabled={!canRefresh} style={{ opacity: canRefresh ? 1 : 0.5 }}>
                <RefreshCw size={12} style={isRefreshing ? { animation: "spin 1s linear infinite" } : {}} /> {isRefreshing ? "Checking..." : !canRefresh && cooldownLeft > 0 ? `Wait ${cooldownLeft}m` : "Refresh Status"}
              </button>
            )}
            <button className="bs" onClick={() => window.open(gcalURL(f, members), "_blank")}><CalIcon /> Google Cal</button>
            <button className="bs" onClick={() => dlICS(f, members)}><Download size={12} /> .ics</button>
            <button className="bs" onClick={() => onEdit(f)}><Edit3 size={12} /> Edit</button>
            <button className="bs" onClick={() => onDelete(f.id)} style={{ borderColor: `${C.danger}30`, color: C.danger }}><Trash2 size={12} /> Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────── */
function Dashboard({ upcoming, flights, members, filterM, setFilterM, applyMF, alerts, next, nextD, totalMiles, totalSpend, onOpenDetail, onAdd, liveStatus, refreshingId, onRefresh }) {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>Flight Deck</h1>
          <PlaneIcon size={22} color={C.accent} />
        </div>
        <button className="bp" onClick={onAdd}><Plus size={14} /> Add Flight</button>
      </div>
      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", background: C.accentSoft, borderRadius: 10, border: "1px solid rgba(199,91,42,0.12)" }}>
              <Bell size={13} color={C.accent} />
              <span style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>{a.t === "d7" ? `${a.f.flightNumber || "Flight"} ${a.f.departureAirport}>${a.f.arrivalAirport} departs in 7 days` : `${a.f.flightNumber || "Flight"} returns tomorrow`}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Stat icon={<PlaneIcon size={15} color={C.olive} />} label="Upcoming" value={upcoming.length} sub={next ? `Next: ${fmtShort(next.departureDate)}` : "None"} color={C.olive} />
        <Stat icon={<CompassRose size={15} color={C.accent} />} label="Total Miles" value={comma(totalMiles)} sub={`${flights.length} flights`} color={C.accent} />
        <Stat icon={<DollarIcon />} label="Spend" value={fmtCur(totalSpend)} sub={flights.length ? `~${fmtCur(totalSpend / flights.length)}/flight` : "--"} color={C.sand} />
        <Stat icon={<Clock size={15} color={C.navy} />} label="Next Trip" value={nextD != null ? (nextD === 0 ? "Today" : `${nextD}d`) : "--"} sub={next ? `${next.departureAirport} > ${next.arrivalAirport}` : ""} color={nextD != null && nextD <= 3 ? C.danger : C.navy} />
      </div>
      <MemFilterBar members={members} filterM={filterM} setFilterM={setFilterM} />
      {upcoming.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 7 }}><PlaneIcon size={15} color={C.accent} /> Upcoming</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{applyMF(upcoming).slice(0, 5).map((f, i) => <FlightCard key={f.id} f={f} i={i} members={members} onOpenDetail={onOpenDetail} liveStatus={liveStatus} refreshingId={refreshingId} onRefresh={onRefresh} />)}</div>
        </div>
      )}
      {flights.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 7 }}><Globe size={15} color={C.navy} /> Flight Map</h2>
          <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}><GlobeMap flights={flights.filter((f) => f.status !== "cancelled")} /></div>
        </div>
      )}
      {flights.length === 0 && (
        <div style={{ textAlign: "center", padding: "44px 20px", background: C.bgCard, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <SunBurst size={44} color={C.accent} />
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, marginTop: 10, marginBottom: 5 }}>No flights yet</h3>
          <p style={{ color: C.textMuted, maxWidth: 320, margin: "0 auto 16px", fontSize: 13 }}>Add your first flight to start tracking.</p>
          <button className="bp" onClick={onAdd}><Plus size={14} /> Add Flight</button>
        </div>
      )}
    </div>
  );
}

/* ── CalendarView ───────────────────────────────────── */
function CalendarView({ calM, calY, setCalM, setCalY, calFBD, onOpenDetail }) {
  const calDays = () => {
    const first = new Date(calY, calM, 1).getDay(), total = new Date(calY, calM + 1, 0).getDate(), d = [];
    for (let i = 0; i < first; i++) d.push(null);
    for (let i = 1; i <= total; i++) d.push(i);
    return d;
  };
  const prevMonth = () => { if (calM === 0) { setCalM(11); setCalY((y) => y - 1); } else setCalM((m) => m - 1); };
  const nextMonth = () => { if (calM === 11) { setCalM(0); setCalY((y) => y + 1); } else setCalM((m) => m + 1); };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}><CalIcon size={18} color={C.accent} /> Calendar</h1>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <button className="bi" onClick={prevMonth}><ChevronLeft size={15} /></button>
        <span style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, minWidth: 160, textAlign: "center" }}>{MO[calM]} {calY}</span>
        <button className="bi" onClick={nextMonth}><ChevronRight size={15} /></button>
      </div>
      <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 12, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, minWidth: 280 }}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d} style={{ textAlign: "center", fontSize: 9, color: C.textDim, fontWeight: 700, padding: "5px 2px", fontFamily: "'Fraunces',serif", textTransform: "uppercase", letterSpacing: 1 }}>{d}</div>)}
          {calDays().map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const ds = `${calY}-${String(calM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const df = calFBD[ds] || [];
            const isT = new Date().toISOString().split("T")[0] === ds;
            return (
              <div key={i} className={`cd ${df.length ? "cf" : ""}`} style={{ padding: "5px 2px", textAlign: "center", minHeight: 48, border: isT ? `1px solid ${C.accent}` : "1px solid transparent" }}>
                <div style={{ fontSize: 12, fontWeight: isT ? 700 : 400, color: isT ? C.accent : df.length ? C.text : C.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>{day}</div>
                {df.map((f, fi) => <div key={fi} onClick={() => onOpenDetail(f)} style={{ fontSize: 7.5, background: `${C.accent}18`, color: C.accent, borderRadius: 3, padding: "1px 2px", marginTop: 1, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{f.departureAirport}{">"}{f.arrivalAirport}</div>)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── ReviewView ─────────────────────────────────────── */
function ReviewView({ yf, yMi, ySp, yAP, yAL, topAP, curYear }) {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}><SunBurst size={20} color={C.accent} /> {curYear} in Review</h1>
      {yf.length === 0 ? (
        <div style={{ textAlign: "center", padding: 36, background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}` }}><p style={{ color: C.textMuted }}>No flights for {curYear}.</p></div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Stat icon={<PlaneIcon size={15} color={C.accent} />} label="Flights" value={yf.length} color={C.accent} />
            <Stat icon={<CompassRose size={15} color={C.olive} />} label="Miles" value={comma(yMi)} sub={yMi > 0 ? `${Math.round(yMi / 24901 * 100)}% around Earth` : ""} color={C.olive} />
            <Stat icon={<MapPin size={15} color={C.navy} />} label="Airports" value={yAP.length} sub={`Hub: ${topAP}`} color={C.navy} />
            <Stat icon={<DollarIcon />} label="Spent" value={fmtCur(ySp)} color={C.sand} />
          </div>
          <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}><GlobeMap flights={yf} /></div>
          {yAL.length > 0 && (
            <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16 }}>
              <div style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: "'Fraunces',serif" }}>Airlines</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{yAL.map((a) => <span key={a} style={{ background: C.bgInput, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: `1px solid ${C.border}` }}>{a}</span>)}</div>
            </div>
          )}
          <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16 }}>
            <div style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: "'Fraunces',serif" }}>Airports</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{yAP.map((a) => <span key={a} style={{ background: C.accentSoft, color: C.accent, padding: "3px 9px", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{a}</span>)}</div>
          </div>
          <div style={{ background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16 }}>
            <div style={{ fontSize: 9, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: "'Fraunces',serif" }}>By Month</div>
            <div style={{ display: "flex", gap: 3, alignItems: "end", height: 70 }}>
              {MO.map((mn, mi) => {
                const cnt = yf.filter((f) => f.departureDate && parseInt(f.departureDate.split("-")[1]) === mi + 1).length;
                const mx = Math.max(1, ...MO.map((_, j) => yf.filter((f) => f.departureDate && parseInt(f.departureDate.split("-")[1]) === j + 1).length));
                return (
                  <div key={mi} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <div style={{ width: "100%", background: cnt ? C.accent : C.bgInput, height: `${Math.max(3, cnt / mx * 55)}px`, borderRadius: 2 }} />
                    <span style={{ fontSize: 7, color: C.textDim, fontFamily: "'JetBrains Mono',monospace" }}>{mn.slice(0, 1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,400&family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${C.bg};font-family:'DM Sans',sans-serif;color:${C.text}}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
  input,select,textarea{background:${C.bgInput};border:1px solid ${C.border};color:${C.text};border-radius:10px;padding:10px 14px;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border-color 0.2s}
  input:focus,select:focus,textarea:focus{border-color:${C.accent}}
  input::placeholder,textarea::placeholder{color:${C.textDim}}
  select option{background:${C.bgCard}}
  .fade-in{animation:fadeIn 0.35s ease-out}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .card-hover{transition:all 0.2s}.card-hover:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(42,37,32,0.08)}
  .stat-card{animation:slideUp 0.5s ease-out backwards}
  .stat-card:nth-child(1){animation-delay:0.05s}.stat-card:nth-child(2){animation-delay:0.1s}.stat-card:nth-child(3){animation-delay:0.15s}.stat-card:nth-child(4){animation-delay:0.2s}
  .fc{animation:slideUp 0.4s ease-out backwards}
  .bp{background:${C.accent};color:#FFFDF8;border:none;border-radius:10px;padding:11px 22px;font-weight:700;font-size:13px;cursor:pointer;font-family:'Fraunces',serif;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px}
  .bp:hover{background:${C.accentHover};transform:translateY(-1px);box-shadow:0 4px 16px rgba(199,91,42,0.25)}
  .bs{background:transparent;color:${C.text};border:1px solid ${C.border};border-radius:10px;padding:8px 16px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;display:inline-flex;align-items:center;gap:6px}
  .bs:hover{border-color:${C.accent};color:${C.accent}}
  .bi{background:transparent;border:1px solid ${C.border};color:${C.textMuted};border-radius:10px;padding:8px;cursor:pointer;transition:all 0.2s;display:inline-flex;align-items:center;justify-content:center}
  .bi:hover{border-color:${C.accent};color:${C.accent}}
  .uz{border:2px dashed ${C.border};border-radius:16px;padding:36px;text-align:center;cursor:pointer;transition:all 0.3s;background:${C.bgInput}}
  .uz:hover,.uz.dg{border-color:${C.accent};background:${C.accentSoft}}
  .cd{transition:all 0.15s;border-radius:8px;cursor:default}.cd:hover{background:${C.bgWarm}}
  .cf{background:${C.accentSoft};border:1px solid rgba(199,91,42,0.2)}
  .tg{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;border:1.5px solid transparent;user-select:none}
  .tg:hover{opacity:0.85}.ts{border-color:currentColor!important}
  @media(max-width:768px){.hm{display:none!important}.gr{grid-template-columns:1fr!important}}
`;

/* ── DB Field Mapping ─────────────────────────────────── */
const toDb = (f, userId) => ({
  user_id: userId,
  flight_number: f.flightNumber || '',
  airline: f.airline || '',
  departure_airport: (f.departureAirport || '').toUpperCase(),
  arrival_airport: (f.arrivalAirport || '').toUpperCase(),
  departure_date: f.departureDate || '',
  departure_time: f.departureTime || '',
  arrival_date: f.arrivalDate || '',
  arrival_time: f.arrivalTime || '',
  departure_terminal: f.departureTerminal || '',
  arrival_terminal: f.arrivalTerminal || '',
  cost: f.cost ? parseFloat(f.cost) : 0,
  miles: f.miles ? parseInt(f.miles) : 0,
  confirmation_code: f.confirmationCode || '',
  notes: f.notes || '',
  status: f.status || 'upcoming',
  tags: f.travelers || [],
  traveler: (f.travelers || []).join(','),
  trip_name: f.tripName || '',
});

const fromDb = (r) => ({
  id: r.id,
  flightNumber: r.flight_number || '',
  airline: r.airline || '',
  departureAirport: r.departure_airport || '',
  arrivalAirport: r.arrival_airport || '',
  departureDate: r.departure_date || '',
  departureTime: r.departure_time || '',
  arrivalDate: r.arrival_date || '',
  arrivalTime: r.arrival_time || '',
  departureTerminal: r.departure_terminal || '',
  arrivalTerminal: r.arrival_terminal || '',
  cost: r.cost || '',
  miles: r.miles || '',
  confirmationCode: r.confirmation_code || '',
  notes: r.notes || '',
  status: r.status || 'upcoming',
  travelers: r.tags || [],
  tripName: r.trip_name || '',
});

/* ── Sign In Screen ───────────────────────────────────── */
function SignInScreen({ onSignIn, loading }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{styles}</style>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <PlaneIcon size={32} color={C.accent} />
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 900, letterSpacing: "-0.5px" }}>Flight Deck</h1>
        </div>
        <div style={{ width: 40, height: 1, background: C.accent, margin: "0 auto 16px" }} />
        <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 36, lineHeight: 1.6 }}>
          Track your flights, share with family, never miss a detail.
        </p>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: "36px 28px" }}>
          <button
            onClick={onSignIn}
            disabled={loading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              padding: "14px 24px", background: C.text, color: C.cream, border: "none", borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: loading ? "wait" : "pointer",
              fontFamily: "'DM Sans',sans-serif", transition: "opacity 0.2s", opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>
          <p style={{ color: C.textDim, fontSize: 11, marginTop: 16 }}>
            Your data stays private. Only family members you invite can see your flights.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN APP — Google Auth + Supabase persistence
   ══════════════════════════════════════════════════════════ */
export default function FlightDeck() {
  // ── Auth state ──
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── App state ──
  const [flights,setFlights] = useState([]);
  const [members,setMembers] = useState(DEF_MEM);
  const [view,setView] = useState("dashboard");
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState({...EMPTY});
  const [calM,setCalM] = useState(new Date().getMonth());
  const [calY,setCalY] = useState(new Date().getFullYear());
  const [loaded,setLoaded] = useState(false);
  const [search,setSearch] = useState("");
  const [detail,setDetail] = useState(null);
  const [filterM,setFilterM] = useState(null);
  const [showMF,setShowMF] = useState(false);
  const [newMem,setNewMem] = useState({name:"",relationship:"spouse"});
  const [notif,setNotif] = useState({enabled:false,email:"",sevenDay:true,twentyFourHr:true});
  const [looking,setLooking] = useState(false);
  const [lookErr,setLookErr] = useState("");
  const [liveStatus,setLiveStatus] = useState({});
  const [refreshingId,setRefreshingId] = useState(null);

  // ── Auth: check session on mount + listen for changes ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    setAuthLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setFlights([]);
    setLoaded(false);
  }, []);

  const userId = session?.user?.id;
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email || '';

  // ── Load flights from Supabase when user signs in ──
// ── Load local prefs (notif only — members now in Supabase) ──
useEffect(() => {
  try {
    const raw = localStorage.getItem('fd-local');
    if (raw) {
      const d = JSON.parse(raw);
      if (d.notif) setNotif(d.notif);
    }
  } catch {}
}, []);

// ── Load flights + travelers from Supabase when user signs in ──
useEffect(() => {
  if (!userId) { setLoaded(true); return; }
  (async () => {
    // Load flights
    const { data: flightData, error: flightErr } = await supabase
      .from('flights')
      .select('*')
      .eq('user_id', userId)
      .order('departure_date', { ascending: true });
    if (!flightErr && flightData) {
      setFlights(flightData.map(fromDb));
    }
    // Load travelers
    const { data: travData, error: travErr } = await supabase
      .from('travelers')
      .select('*')
      .eq('user_id', userId);
    if (!travErr && travData && travData.length > 0) {
      // Always ensure "Me" is present
      const hasME = travData.some(t => t.id === 'me');
      const loaded = travData.map(t => ({ id: t.id, name: t.name, relationship: t.relationship, color: t.color }));
      if (!hasME) loaded.unshift(DEF_MEM[0]);
      setMembers(loaded);
    } else {
      // First time — seed "Me" into Supabase
      setMembers(DEF_MEM);
      await supabase.from('travelers').upsert({
        id: 'me', user_id: userId, name: 'Me', relationship: 'self', color: C.accent,
      });
    }
    setLoaded(true);
  })();
}, [userId]);

  // ── Save notif prefs to localStorage (members now in Supabase) ──
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem('fd-local', JSON.stringify({ notif })); } catch {}
  }, [notif, loaded]);

  // ── Form updater ──
  const uf = useCallback((k,v) => setForm(p=>({...p,[k]:v})),[]);

  // ── Flight Lookup ──
  const lookupFlight = useCallback(async () => {
    if (!form.flightNumber || !form.departureDate) {
      setLookErr("Enter flight number and departure date first.");
      return;
    }
    setLooking(true);
    setLookErr("");
    try {
      const resp = await fetch("/api/lookup-flight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightNumber: form.flightNumber, departureDate: form.departureDate }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data.ok === false) {
        if (resp.status === 404) {
          setLookErr("Lookup API not available (no /api route). Deploy to Vercel or run `vercel dev` locally.");
        } else {
          setLookErr(data.error || "Lookup failed. You can enter details manually.");
        }
        return;
      }
      const parsed = data.flight;
      if (!parsed) {
        setLookErr("Couldn't find flight details. Check the flight number and date.");
        return;
      }
      setForm((prev) => {
        const dep = (parsed.departureAirport || "").toUpperCase();
        const arr = (parsed.arrivalAirport || "").toUpperCase();
        const miles = getDist(dep, arr);
        return {
          ...prev,
          airline: parsed.airline || prev.airline,
          departureAirport: dep || prev.departureAirport,
          arrivalAirport: arr || prev.arrivalAirport,
          departureTime: parsed.departureTime || prev.departureTime,
          arrivalTime: parsed.arrivalTime || prev.arrivalTime,
          arrivalDate: parsed.arrivalDate || prev.arrivalDate,
          departureTerminal: parsed.departureTerminal || prev.departureTerminal,
          arrivalTerminal: parsed.arrivalTerminal || prev.arrivalTerminal,
          miles: miles || prev.miles,
        };
      });
    } catch {
      setLookErr("Lookup failed. You can enter details manually.");
    } finally {
      setLooking(false);
    }
  }, [form.flightNumber, form.departureDate]);

  // ── Flight Status Refresh (AviationStack only — no Anthropic cost) ──
  const refreshFlight = useCallback(async (f) => {
    if (!f.flightNumber) return;
    setRefreshingId(f.id);
    try {
      const resp = await fetch("/api/refresh-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightNumber: f.flightNumber, departureDate: f.departureDate }),
      });
      const data = await resp.json().catch(() => ({}));
      if (data.status) {
        setLiveStatus(prev => ({ ...prev, [f.id]: data.status }));
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshingId(null);
    }
  }, []);

  // ── CRUD (Supabase) ──
  const save = useCallback(async () => {
    if (!userId) return;
    const f = {
      ...form,
      cost: form.cost ? parseFloat(form.cost) : null,
      miles: form.miles ? parseInt(form.miles) : getDist(form.departureAirport, form.arrivalAirport),
      departureAirport: (form.departureAirport || "").toUpperCase(),
      arrivalAirport: (form.arrivalAirport || "").toUpperCase(),
    };

    if (editing) {
      // Update existing flight
      const { error } = await supabase
        .from('flights')
        .update(toDb(f, userId))
        .eq('id', editing)
        .eq('user_id', userId);
      if (!error) {
        setFlights(p => p.map(fl => fl.id === editing ? { ...f, id: editing } : fl));
      }
      setEditing(null);
    } else {
      // Insert new flight
      const { data, error } = await supabase
        .from('flights')
        .insert(toDb(f, userId))
        .select()
        .single();
      if (!error && data) {
        setFlights(p => [...p, fromDb(data)]);
      }
    }
    setForm({ ...EMPTY });
    setView("flights");
  }, [form, editing, userId]);

  const del = useCallback(async (id) => {
    if (!userId) return;
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (!error) {
      setFlights(p => p.filter(f => f.id !== id));
    }
    setDetail(null);
  }, [userId]);

  const edit = useCallback((f) => {
    setForm({ ...f, cost: f.cost ?? "", miles: f.miles ?? "" });
    setEditing(f.id);
    setView("add");
    setDetail(null);
  }, []);

  const addMem = useCallback(async () => {
    if (!newMem.name.trim() || !userId) return;
    const m = { id: genId(), name: newMem.name.trim(), relationship: newMem.relationship, color: REL_COL[newMem.relationship] || C.textMuted };
    setMembers(p => [...p, m]);
    setNewMem({ name: "", relationship: "spouse" });
    setShowMF(false);
    await supabase.from('travelers').insert({ id: m.id, user_id: userId, name: m.name, relationship: m.relationship, color: m.color });
  }, [newMem, userId]);

  const rmMem = useCallback(async (id) => {
    if (id === "me" || !userId) return;
    setMembers(p => p.filter(m => m.id !== id));
    setFlights(p => p.map(f => ({ ...f, travelers: (f.travelers || []).filter(t => t !== id) })));
    await supabase.from('travelers').delete().eq('id', id).eq('user_id', userId);
  }, [userId]);

  const togTrav = useCallback((id) => setForm(p => ({ ...p, travelers: (p.travelers || []).includes(id) ? (p.travelers || []).filter(t => t !== id) : [...(p.travelers || []), id] })), []);

  const handleNav = useCallback((id) => setView(id), []);

  const handleAdd = useCallback(() => { setForm({ ...EMPTY }); setEditing(null); setView("add"); }, []);

  // ── Computed ──
  const sorted = useMemo(() => [...flights].sort((a, b) => (a.departureDate || "").localeCompare(b.departureDate || "")), [flights]);
  const filtered = useMemo(() => { let r = sorted; if (filterM) r = r.filter(f => (f.travelers || []).includes(filterM)); if (search) r = r.filter(f => [f.airline, f.flightNumber, f.departureAirport, f.arrivalAirport, f.confirmationCode, f.notes, f.tripName].filter(Boolean).some(v => v.toLowerCase().includes(search.toLowerCase()))); return r }, [sorted, filterM, search]);
  const upcoming = useMemo(() => sorted.filter(f => f.status === "upcoming" && daysTo(f.departureDate) >= 0), [sorted]);
  const totalSpend = useMemo(() => flights.reduce((s, f) => s + (f.cost || 0), 0), [flights]);
  const totalMiles = useMemo(() => flights.filter(f => f.status !== "cancelled").reduce((s, f) => s + (f.miles || 0), 0), [flights]);
  const next = upcoming[0], nextD = next ? daysTo(next.departureDate) : null;
  const curYear = new Date().getFullYear();
  const yf = useMemo(() => flights.filter(f => f.departureDate?.startsWith(String(curYear)) && f.status !== "cancelled"), [flights, curYear]);
  const yMi = useMemo(() => yf.reduce((s, f) => s + (f.miles || 0), 0), [yf]);
  const ySp = useMemo(() => yf.reduce((s, f) => s + (f.cost || 0), 0), [yf]);
  const yAP = useMemo(() => [...new Set(yf.flatMap(f => [f.departureAirport, f.arrivalAirport].filter(Boolean)))], [yf]);
  const yAL = useMemo(() => [...new Set(yf.map(f => airlineName(f.flightNumber)).filter(v => v && v.length > 2))], [yf]);
  const topAP = useMemo(() => { const c = {}; yf.forEach(f => { [f.departureAirport, f.arrivalAirport].filter(Boolean).forEach(a => { c[a] = (c[a] || 0) + 1 }) }); return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || "--" }, [yf]);
  const calFBD = useMemo(() => { const m = {}; flights.forEach(f => { if (f.departureDate) { if (!m[f.departureDate]) m[f.departureDate] = []; m[f.departureDate].push(f) } }); return m }, [flights]);
  const tripNames = useMemo(() => [...new Set(flights.map(f => f.tripName).filter(Boolean))].sort(), [flights]);

  const alerts = useMemo(() => { if (!notif.enabled) return []; const a = []; flights.forEach(f => { if (f.status !== "upcoming") return; if (notif.sevenDay && daysTo(f.departureDate) === 7) a.push({ t: "d7", f }); if (notif.twentyFourHr && daysTo(f.arrivalDate) === 1) a.push({ t: "r24", f }) }); return a }, [flights, notif]);

  const applyMF = useCallback((list) => filterM ? list.filter(f => (f.travelers || []).includes(filterM)) : list, [filterM]);

  // ── Auth loading ──
  if (authLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: C.bg }}><Loader2 size={24} color={C.accent} style={{ animation: "spin 1s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  // ── Not signed in ──
  if (!session) return <SignInScreen onSignIn={signIn} loading={authLoading} />;

  // ── Data loading ──
  if (!loaded) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: C.bg }}><Loader2 size={24} color={C.accent} style={{ animation: "spin 1s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{styles}</style>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: `${C.bg}ee`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", justifyContent: "center", gap: 1, padding: "2px 8px", overflowX: "auto" }}>
          <NavTab icon={BarChart3} label="Home" id="dashboard" active={view === "dashboard"} onNav={handleNav} />
          <NavTab ci={<PlaneIcon size={16} color={view === "flights" ? C.accent : C.textMuted} />} label="Flights" id="flights" active={view === "flights"} onNav={handleNav} />
          <NavTab icon={Star} label="Review" id="review" active={view === "review"} onNav={handleNav} />
          <NavTab icon={Compass} label="Calendar" id="calendar" active={view === "calendar"} onNav={handleNav} />
          <NavTab icon={Users} label="Family" id="family" active={view === "family"} onNav={handleNav} />
          <NavTab icon={Plus} label="Add" id="add" active={view === "add"} onNav={handleNav} />
        </div>
      </nav>
      {/* User bar */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "8px 12px 0", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
        {session.user?.user_metadata?.avatar_url && (
          <img src={session.user.user_metadata.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: "50%", border: `1px solid ${C.border}` }} />
        )}
        <span style={{ fontSize: 11, color: C.textMuted }}>{userName}</span>
        <button onClick={signOut} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.textDim, padding: "4px 8px", borderRadius: 6, transition: "color 0.2s" }}>
          <LogOut size={12} /> Sign out
        </button>
      </div>
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "12px 12px 80px" }}>
        {view === "dashboard" && (
          <Dashboard
            upcoming={upcoming} flights={flights} members={members}
            filterM={filterM} setFilterM={setFilterM} applyMF={applyMF}
            alerts={alerts} next={next} nextD={nextD}
            totalMiles={totalMiles} totalSpend={totalSpend}
            onOpenDetail={setDetail} onAdd={handleAdd}
            liveStatus={liveStatus} refreshingId={refreshingId} onRefresh={refreshFlight}
          />
        )}
        {view === "flights" && (
          <FlightsView
            search={search} setSearch={setSearch} filtered={filtered}
            applyMF={applyMF} members={members} filterM={filterM}
            setFilterM={setFilterM} onOpenDetail={setDetail} onAdd={handleAdd}
            liveStatus={liveStatus} refreshingId={refreshingId} onRefresh={refreshFlight}
          />
        )}
        {view === "calendar" && (
          <CalendarView
            calM={calM} calY={calY} setCalM={setCalM} setCalY={setCalY}
            calFBD={calFBD} onOpenDetail={setDetail}
          />
        )}
        {view === "review" && (
          <ReviewView
            yf={yf} yMi={yMi} ySp={ySp} yAP={yAP} yAL={yAL}
            topAP={topAP} curYear={curYear}
          />
        )}
        {view === "family" && (
          <FamilyView
            showMF={showMF} setShowMF={setShowMF} newMem={newMem}
            setNewMem={setNewMem} addMem={addMem} members={members}
            rmMem={rmMem} notif={notif} setNotif={setNotif}
            upcoming={upcoming} members2={members}
          />
        )}
        {view === "add" && (
          <AddFlightForm
            editing={editing} form={form} uf={uf}
            lookupFlight={lookupFlight} looking={looking} lookErr={lookErr}
            members={members} togTrav={togTrav} save={save}
            setView={setView} setEditing={setEditing} setForm={setForm}
            tripNames={tripNames}
          />
        )}
      </main>
      {detail && <DetailModal f={detail} members={members} onClose={() => setDetail(null)} onEdit={edit} onDelete={del} liveStatus={liveStatus} refreshingId={refreshingId} onRefresh={refreshFlight} />}
    </div>
  );
}
