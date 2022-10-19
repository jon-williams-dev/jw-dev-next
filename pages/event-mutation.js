import Link from "next/link";
import React from "react";
import { useMutation, useQuery, ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://engine.is.tue.mpg.de/is_web_engine/graphql',
  cache: new InMemoryCache(),
});

const ADD_REGISTRATION = gql`
  mutation AddRegistration {
    addRegistration(
      input:{
        registrationFormId: 41,
        properties: { first_name: "Peter", last_name: "Piper", email: "peter.piper@mpg.de", transport_required: "false", dietary_requirements: "none" }
      }
    ) {
     registration {
       id
       properties
     }
   }
  }
`;

function AddRegistration() {
  let input;
  const [addRegistration, { data, loading, error }] = useMutation(ADD_REGISTRATION);

  if (loading) return 'Submitting...';
  if (error) return `Submission error! ${error.message}`;

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          addRegistration();
        }}
      >
        <button type="submit">Add Registration</button>
      </form>
    </div>
  );
}

export default function Registration(props) {
 
  return (
    <ApolloProvider client={client}>
         <AddRegistration />
    </ApolloProvider>
  );
}
