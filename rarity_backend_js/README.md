## USER REGISTRATION PROCESS

- Users can register their nft collection through form ,we assume that the data is not empty in the
  front-end while submission.
  Route - POST (/collection/create)

## FRONT-END UI ROUTES

### General Routes

- To get all latest collections
  Route - GET (/collection/get_latest_collection)

- To get top collections
  Route - GET (/collection/get_top_collection)

- To get all collections
  Route - GET (/collection/get_all_collection)

- To get specific collections
  Route - GET (/api/v1//:collection_slug)

- To get specific collections stats
  Route - GET (/apiv1/:collection_slug/stats)

### Ranking Routes

- To get rank based collection on Rarity score
  Route - GET (/api/get_ranked_collection/:collection_slug)

- To get rank based collection on Average score
  Route - GET (/api/get_ranked_collection/:collection_slug?method=average)

- To get rank based collection on Statistical score
  Route - GET (/api/get_ranked_collection/:collection_slug?method=statistical)

### Pagination is Embedded

- To get to specific page
  Route - GET (/api/get_ranked_collection/:collection_slug?page=[page-no])

- In each request we get 20 token_id’s data .
