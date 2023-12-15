import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  // uri: 'https://api-eu-central-1.graphcms.com/v2/cl00p3jsz9avs01z82fe3gnog/master',
  uri: 'https://api-eu-central-1-shared-euc1-02.hygraph.com/v2/cllwoozt80eh801uf23t4e2ct/master',
  cache: new InMemoryCache()
});

export default client