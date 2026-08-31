# Focus5

**Five things. One workday.**

Focus5 to prosty, local-first planer dnia pracy oparty na jednej zasadzie:

> maksymalnie 5 najważniejszych zadań na dany dzień.

Projekt powstał jako lekka alternatywa dla rozbudowanych systemów zarządzania zadaniami, CRM-ów i aplikacji zapisujących dużą historię aktywności.

Celem Focus5 jest skupienie użytkownika na kilku konkretnych rzeczach, które rzeczywiście chce wykonać w ciągu dnia.

---

## Live Demo


https://cz-czarek.github.io/focus5/

---

## Funkcje

- maksymalnie 5 zadań jednocześnie,
- dodawanie nowych zadań,
- edycja istniejących zadań,
- usuwanie zadań,
- oznaczanie zadań jako wykonane,
- zapis godziny wykonania,
- opcjonalna godzina realizacji zadania,
- opcjonalna notatka,
- informacja o zbliżającym się terminie zadania,
- oznaczenie zadania jako aktualnego lub zaległego,
- dostępne tylko pozostałe godziny bieżącego dnia,
- zapis danych po odświeżeniu strony,
- ręczne czyszczenie całej listy,
- automatyczne czyszczenie listy w wybranym terminie,
- odliczanie do automatycznego usunięcia,
- opcjonalna 4-cyfrowa ochrona PIN,
- ręczne blokowanie aplikacji,
- reset danych w przypadku utraty PIN-u,
- responsywny interfejs.

---

## Local-first

Focus5 nie wymaga:

- zakładania konta,
- logowania do zewnętrznej usługi,
- backendu,
- zewnętrznej bazy danych.

Dane są przechowywane lokalnie w przeglądarce użytkownika.

Aplikacja nie wysyła treści zadań na zewnętrzny serwer.

---

## Ochrona PIN

Focus5 posiada opcjonalną 4-cyfrową blokadę PIN.

Po jej aktywowaniu dane zadań są przechowywane lokalnie w postaci zaszyfrowanej.

W projekcie wykorzystane zostały mechanizmy dostępne w Web Crypto API, między innymi:

- PBKDF2,
- SHA-256,
- AES-GCM.

PIN nie jest zapisywany bezpośrednio jako zwykły tekst w `localStorage`.

### Ważne

4-cyfrowy PIN należy traktować jako dodatkową warstwę prywatności, a nie jako zabezpieczenie przeznaczone do przechowywania haseł, poufnych danych firmowych lub innych informacji wymagających wysokiego poziomu ochrony.

---

## Technologie

Projekt wykorzystuje:

- HTML5
- CSS3
- JavaScript
- Local Storage
- Web Crypto API
- Git
- GitHub
- GitHub Pages

Projekt został wykonany bez frameworków i zewnętrznych bibliotek JavaScript.

---

## Założenia projektu

Focus5 celowo nie jest rozbudowanym systemem zarządzania projektami.

Limit pięciu zadań jest częścią koncepcji aplikacji.

Wykonane zadanie nadal zajmuje jedno z pięciu miejsc, dopóki użytkownik go nie usunie lub lista nie zostanie wyczyszczona.

Celem jest utrzymanie krótkiej i świadomie ograniczonej listy zadań na jeden dzień.

---

## O projekcie

Focus5 jest jednym z moich projektów wykonywanych podczas nauki podstaw tworzenia aplikacji webowych.

Projekt pozwolił mi w praktyce zetknąć się między innymi z:

- HTML i CSS,
- JavaScriptem,
- pracą z Git i GitHub,
- przechowywaniem danych w przeglądarce,
- obsługą czasu i dat,
- podstawami logiki aplikacji,
- testowaniem kolejnych funkcji,
- debugowaniem problemów pojawiających się podczas rozwoju projektu.

Na obecnym etapie traktuję projekt przede wszystkim jako praktyczne ćwiczenie i sposób na stopniowe poznawanie technologii webowych.

---

## Wykorzystanie AI

AI odegrało dużą rolę w powstaniu projektu.

Zostało wykorzystane między innymi do:

- zaplanowania struktury aplikacji,
- generowania kodu HTML, CSS i JavaScript,
- rozwijania kolejnych funkcji,
- poprawiania błędów,
- analizowania problemów,
- proponowania rozwiązań UX,
- wyjaśniania działania wybranych fragmentów kodu,
- przygotowania dokumentacji projektu.

Moja rola polegała przede wszystkim na:

- określeniu pomysłu i kierunku projektu,
- wyborze funkcji,
- stopniowym wdrażaniu kodu,
- testowaniu działania aplikacji,
- zgłaszaniu błędów i problemów,
- podejmowaniu decyzji dotyczących wyglądu i działania,
- pracy z GitHubem i publikacją projektu.

Projekt nie ma przedstawiać mnie jako doświadczonego programisty.

Jego celem jest pokazanie procesu nauki, umiejętności korzystania z narzędzi AI oraz stopniowego rozwijania praktycznych umiejętności technicznych.

---

## Status

**Focus5 v1 — completed**

Podstawowa wersja aplikacji jest ukończona.

Możliwe przyszłe rozszerzenia:

- powiadomienia przeglądarkowe,
- dodatkowa personalizacja,
- dalsze usprawnienia interfejsu.

---

## Autor

Projekt wykonany jako część własnego portfolio i nauki tworzenia aplikacji webowych.