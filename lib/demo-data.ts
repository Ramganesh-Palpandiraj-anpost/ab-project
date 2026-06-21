import type { Donation, Expense, Member } from "./types";
export const members: Member[] = [
  { id:"1", member_name:"Arun Kumar", family_name:"Muthu Family", phone:"98765 43210", status:"active", annual_commitment:12000 },
  { id:"2", member_name:"Bala Murugan", family_name:"Selvam Family", phone:"98421 33445", status:"active", annual_commitment:12000 },
  { id:"3", member_name:"Ganesh Raj", family_name:"Rajan Family", phone:"97901 11223", status:"active", annual_commitment:12000 },
  { id:"4", member_name:"Karthik S", family_name:"Siva Family", phone:"94430 55667", status:"inactive", annual_commitment:12000 },
  { id:"5", member_name:"Prabhu M", family_name:"Mani Family", phone:"90030 77889", status:"active", annual_commitment:12000 }
];
export const donations: Donation[] = [
  {id:"d1",member_id:"1",member_name:"Arun Kumar",donation_year:2026,amount:12000,donation_type:"Sandha",payment_date:"2026-01-14",remarks:"Annual contribution"},
  {id:"d2",member_id:"2",member_name:"Bala Murugan",donation_year:2026,amount:8500,donation_type:"Sandha",payment_date:"2026-02-02",remarks:"Part payment"},
  {id:"d3",member_id:"3",member_name:"Ganesh Raj",donation_year:2026,amount:5000,donation_type:"Donation",payment_date:"2026-03-18",remarks:"Festival donation"},
  {id:"d4",member_id:"5",member_name:"Prabhu M",donation_year:2026,amount:10000,donation_type:"Sandha",payment_date:"2026-04-09",remarks:null}
];
export const expenses: Expense[] = [
  {id:"e1",expense_date:"2026-01-20",amount:18500,category:"Festival",description:"Pongal community event"},
  {id:"e2",expense_date:"2026-02-12",amount:6500,category:"Charity",description:"School supplies"},
  {id:"e3",expense_date:"2026-03-05",amount:4200,category:"Maintenance",description:"Hall repairs"},
  {id:"e4",expense_date:"2026-04-14",amount:2800,category:"Temple",description:"Festival contribution"}
];
export const trend = [{name:"Jan",donations:12000},{name:"Feb",donations:8500},{name:"Mar",donations:5000},{name:"Apr",donations:10000},{name:"May",donations:14500},{name:"Jun",donations:11000}];
export const yearly = [{name:"2022",donations:142000},{name:"2023",donations:168000},{name:"2024",donations:185000},{name:"2025",donations:214000},{name:"2026",donations:61000}];
