# Bonus Ethereum Contract Bot

## Instalacija i pokretanje
Kada se skine projekat, potrebno je da se uradi: 'npm i' kako bi se skinule potrebne biblioteke ( express, web3 i socket.io ) jer nije okacen node_modules/. 
Nakon toga se pokrece sa komandom node app.js.

## Ideja
Ideja je bila indenticna kao u zadatku bez bonus dela, jedina razlika je ta sto vise server nema unapred zadatog user-a koji ce da placa gas za transakciju i da je potpise. 

Sada je potrebno da se user svojevoljno preko front-a ubaci u red da bi ucestovao u upisivanju u contract ( i placao potreban gas i bio potpisan ). Kada user odluci da zeli da ucestvuje, 
otvara se socket i kada je on na redu da plati transakciju, salju mu se svi potrebni podaci, front.js dodaje njegovu adresu sa wallet-a i salje transakciju. Kako transakcija nije 
potpisana, njemu se automatski otvara dijalog sa wallet-om ( metamask extension na google chrome-u recimo ) gde on potvrdjuje ( ili reject-uje ) transakciju. Tako server nema nikakve
kontakte za privateKey-em usera. 

Ukoliko nijedan user nije u redu za placanje ( nije se niko prijavio ili su se svi odjavili ), server ce nastaviti da radi sve poslove 
( bez izvrsavanja transakcije jer nema user-a da plati gas ) dok se ne ispuni uslov da se prijavi user ( i da su ostala dva uslova ispunjena ) i njemu posalje da plati transakciju.

### Sam proces biranja i cuvanja user-a se vrsi na sledeci nacin: postoji lista user-a koji su se konektovali kao i pokazivac na sledeceg koji treba da plati gas.
Kada se posalje transakcija, pokazivac se pomera na sledece mesto ( ili vrati na pocetak ako je poslednji bio na redu ). 
U listi se nalazi id socketa svakog usera, koliko se user odjavi, izbacuje se iz liste. 
Lista je na pocetku prazna a pokazivac je -1, sve se cuva u radnoj memoriji dok radi server i nakon gasenja se brise. ( moglo je naravno i da se cuva u mySql ili MongoDB 
ali nisam video potrebu za tim na ovom zadatku )
