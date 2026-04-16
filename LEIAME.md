# guardian-js

> Toolkit stateless e privacy-first para verificação de idade e classificação de conteúdo — construído para conformidade com o ECA Digital brasileiro (Lei 15.211/2025) e além.

[![Licença](https://img.shields.io/badge/licen%C3%A7a-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-pr%C3%A9--alpha-orange.svg)]()
[![Linguagem](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()

---

## O que é o guardian-js?

O **guardian-js** é um toolkit TypeScript open source que ajuda plataformas digitais a implementar verificação de idade e classificação de conteúdo de forma padronizada e com preservação de privacidade.

**Não é** um serviço de armazenamento de dados. **Não é** um sistema de reporte para órgãos governamentais. É uma biblioteca composável que fornece a infraestrutura de integração — sua plataforma é dona das decisões e das obrigações de conformidade.

A biblioteca foi criada em resposta direta ao **ECA Digital (Lei 15.211/2025)**, a primeira lei da América Latina a impor requisitos aplicáveis de verificação de idade a plataformas digitais, em vigor desde **17 de março de 2026**. O design é intencionalmente agnóstico em relação à jurisdição e pode ser adaptado para o DSA europeu, o UK Age Appropriate Design Code, e frameworks similares.

---

## Princípios fundamentais

**Stateless por design** — o guardian-js processa entradas e retorna saídas. Nunca armazena dados pessoais, nunca registra identificadores de usuários e nunca se comunica com serviços externos por conta própria sem configuração explícita.

**Você é o dono da conformidade** — a biblioteca retorna resultados estruturados. O que sua plataforma faz com esses resultados — bloquear acesso, iniciar um fluxo de consentimento parental, registrar para auditoria — é inteiramente sua responsabilidade. O guardian-js é uma ferramenta, não um serviço de compliance.

**Baseado em adapters** — cada dependência externa (provedores de identidade, APIs de moderação de conteúdo, runtimes de ML) fica atrás de uma interface de adapter. Você escolhe seus provedores e pode trocá-los sem alterar o código de integração.

**Superfície mínima de dados** — os fluxos de verificação de idade são projetados para que dados de identidade sensíveis trafeguem diretamente entre o usuário e o provedor de identidade, sem passar pelo guardian-js.

---

## Pacotes

Este repositório é um monorepo. Os pacotes são publicados independentemente sob o escopo `@guardian-js`.

| Pacote | Descrição | Status |
|---|---|---|
| `@guardian-js/age-verification` | Fluxos padronizados de verificação de idade com adapters de provedores plugáveis | Planejado |
| `@guardian-js/content-classification` | Classificação de risco de conteúdo com adapters de backend plugáveis | Planejado |
| `@guardian-js/core` | Tipos compartilhados, schemas de resultado e utilitários | Planejado |

---

## O que o guardian-js NÃO faz

Isso é explícito e intencional:

- Não armazena nenhum dado pessoal
- Não armazena resultados de verificação vinculados a identificadores de usuários
- Não se comunica com órgãos governamentais ou autoridades
- Não toma decisões finais de controle de acesso
- Não substitui assessoria jurídica nem garante conformidade regulatória
- Não realiza reconhecimento facial ou análise biométrica

---

## Conformidade com o ECA Digital

O ECA Digital (Lei 15.211/2025) exige que plataformas digitais implementem mecanismos confiáveis de verificação de idade, substituindo a autodeclaração por alternativas técnicas verificáveis. O guardian-js fornece a camada de integração padronizada para que desenvolvedores brasileiros possam implementar esses fluxos sem reinventar a roda.

A fiscalização é de responsabilidade da ANPD (Autoridade Nacional de Proteção de Dados). O guardian-js não garante conformidade com a lei — a responsabilidade pela implementação correta e pelo cumprimento das obrigações legais é sempre da plataforma que utiliza a biblioteca.

---

## Aviso legal

O guardian-js é uma biblioteca de software fornecida no estado em que se encontra, sob a licença Apache 2.0. Não é um serviço de conformidade legal. O uso desta biblioteca não garante que sua plataforma está em conformidade com qualquer lei ou regulação. Você é responsável por entender suas obrigações legais e implementar os controles adequados. Consulte sempre um advogado qualificado para decisões de compliance.

---

## Documentação

- [English README](README.md)
- [Escopo do Projeto](SCOPE.md)
- [Como Contribuir](CONTRIBUTING.md)
- [Código de Conduta](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)

---

## Licença

Apache License 2.0 — veja [LICENSE](LICENSE) para detalhes.
