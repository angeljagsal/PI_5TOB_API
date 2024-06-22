import neo4j from 'neo4j-driver'

const neo4jUri = 'bolt://localhost';
const neo4jUser = 'neo4j';
const neo4jPass = 'traveldb123';

const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPass));

const getSession = () => {
  return driver.session();
}

export { driver, getSession };
