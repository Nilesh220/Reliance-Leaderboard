-- ===================================================
-- Migration: Add Email Column to POCs and Seed Data
-- ===================================================

-- 1. Add email column to pocs table if it doesn't exist
alter table pocs add column if not exists email text;

-- 2. Populate email column for existing POCs
update pocs set email = 'itssuhani31@gmail.com' where id = 'poc_suhani_singh_1781100674';
update pocs set email = 'darshbhoirdmce@gmail.com' where id = 'mum_08';
update pocs set email = 'ysumeet2004@gmail.com' where id = 'pun_08';
update pocs set email = 'shivrajshirsikar790@gmail.com' where id = 'pun_01';
update pocs set email = 'shelkesid309@gmail.com' where id = 'pun_13';
update pocs set email = 'samrudhichavan06@gmail.com' where id = 'pun_17';
update pocs set email = 'dhruvpathare@gmail.com' where id = 'mum_06';
update pocs set email = 'sanchitashelar2607@gmail.com' where id = 'aur_05';
update pocs set email = 'pranavsonawane2226@gmail.com' where id = 'pun_25';
update pocs set email = 'dhruvkapoor15@gmail.com' where id = 'pun_03';
update pocs set email = 'lavesh05a@gmail.com' where id = 'pun_06';
update pocs set email = 'yligade77@gmail.com' where id = 'pun_09';
update pocs set email = 'junaidkassar2580@gmail.com' where id = 'pun_12';
update pocs set email = 'bhoomis484@gmail.com' where id = 'pun_15';
update pocs set email = 'ninadofficial184@gmail.com' where id = 'pun_18';
update pocs set email = 'ayushkumarmodi973@gmail.com' where id = 'pun_24';
update pocs set email = 'edu.bhaktidhage@gmail.com' where id = 'aur_01';
update pocs set email = 'pritam.tel2071@gmail.com' where id = 'aur_06';
update pocs set email = 'nagesh2005gowda@gmail.com' where id = 'poc_nagesh_gowda_1781514794';
update pocs set email = 'hemani.palak@gmail.com' where id = 'poc_palak_hemani_1781514794';
update pocs set email = 'svishwakarma8878@gmail.com' where id = 'poc_shobha_vishwakarma_1781514794';
update pocs set email = 'adityavagare261@gmail.com' where id = 'mum_12';
update pocs set email = 'shaikhalshifa220@gmail.com' where id = 'mum_01';
update pocs set email = 'smitgondole@gmail.com' where id = 'pun_14';
update pocs set email = 'yajatyadav.36@gmail.com' where id = 'mum_11';
update pocs set email = 'dishasonigra95@gmail.com' where id = 'poc_disha_sonigra_1781100671';
update pocs set email = 'showshweta01@gmail.com' where id = 'pun_16';
update pocs set email = 'rangolesiddhant@student.sfit.ac.in' where id = 'mum_02';
update pocs set email = 'melaniefernandes27088@gmail.com' where id = 'poc_melanie_fernandes_1781100673';
update pocs set email = 'nikhilsharma27062007@gmail.com' where id = 'poc_nikhil_sharma_1781100670';
update pocs set email = '2015piyushgu@gmail.com' where id = 'mum_10';
update pocs set email = 'nityas150694@gmail.com' where id = 'poc_nitya_singh_1781100672';
update pocs set email = 'yashjeetmakhija31@gmail.com' where id = 'pun_11';
update pocs set email = 'hariomsandve80100@gmail.com' where id = 'pun_05';
update pocs set email = 'sarangi20052006@gmail.com' where id = 'pun_21';
update pocs set email = 'dikshabhagat2905@gmail.com' where id = 'aur_04';
update pocs set email = 'vedbatra05@gmail.com' where id = 'pun_23';
update pocs set email = 'radheywandhekar4321@gmail.com' where id = 'mum_09';
update pocs set email = 'sakshibhoite71@gmail.com' where id = 'mum_04';
update pocs set email = 'architvishwakarma72@gmail.com' where id = 'mum_17';
update pocs set email = 'krishnakadu2004@gmail.com' where id = 'pun_10';
update pocs set email = 'dhruv.nile07@gmail.com' where id = 'pun_19';
update pocs set email = 'aish171105@gmail.com' where id = 'poc_aishwarya_tiwari_1781515693';
update pocs set email = 'vedt024@gmail.com' where id = 'aur_03';
update pocs set email = 'nikitakatolkar2006@gmail.com' where id = 'pun_02';
update pocs set email = 'arch25014@gmail.com' where id = 'mum_13';
update pocs set email = 'tarunkhatri468@gmail.com' where id = 'mum_14';
update pocs set email = 'prajwalghagre04@gmail.com' where id = 'pun_20';
-- WARNING: No email found for POC 'pun_07': Anuj
update pocs set email = 'jairajhuse28@gmail.com' where id = 'aur_02';
update pocs set email = 'veerbatra1022@gmail.com' where id = 'pun_04';
update pocs set email = 'vedant30.kanekar@gmail.com' where id = 'mum_16';
update pocs set email = 'dakshitachawla148@gmail.com' where id = 'mum_05';
update pocs set email = 'harshgupta5217@gmail.com' where id = 'mum_03';

-- 3. Add Nilesh Vigor as a test POC
insert into pocs (id, name, college, city, email, points) 
values ('nilesh_test', 'Nilesh Vigor', 'Vigor Launchpad', 'Mumbai', 'nilesh@vigorlaunchpad.com', 0)
on conflict (id) do update set email = 'nilesh@vigorlaunchpad.com';
