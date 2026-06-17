# Phase 4: Busca Aprimorada e Filtros — Discussion Log

| Round | Perspective | Question summary | Decision locked |
|-------|-------------|------------------|-----------------|
| 1     | UI/UX       | Como os usuários devem selecionar as opções de Marca, Modelo, etc. na tela mobile? | Utilizar Bottom Sheets customizados com busca interna. |
| 2     | Frontend    | Qual a estratégia para o carregamento em cascata? | Fetch On Demand (carrega modelos apenas após escolher a marca). |
| 3     | Backend/DB  | Como lidar com Combustível e Quilometragem? | Combustível será um ENUM, filtrado de forma exata. Quilometragem será um Int e filtrado como limite (ex: Até 50k km). |
