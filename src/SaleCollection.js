import './App.css';

import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import {useState, useEffect} from 'react';
import {getSaleNFTsScript} from "./cadence/scripts/get_sale_nfts";
import {purchaseTx} from "./cadence/transactions/purchase.js";

function SaleCollection(props) {
  const [nfts, setNFTs] = useState([]);

  useEffect(() => {
    getUserSaleNFTs();
  }, [])

  const getUserSaleNFTs = async () => {
      const result = await fcl.send([
          fcl.script(getSaleNFTsScript),
          fcl.args([
              fcl.arg(props.address, t.Address)
          ])
      ]).then(fcl.decode);

      console.log(result);
      setNFTs(result);
  }

  const purchase = async (id) => {
    const transactionId = await fcl.send([
        fcl.transaction(purchaseTx),
        fcl.args([
          fcl.arg(props.address, t.Address),
          fcl.arg(parseInt(id), t.UInt64)
        ]),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999)
      ]).then(fcl.decode);
  
      console.log(transactionId);
      return fcl.tx(transactionId).onceSealed();
  }
 
  return (
    <div style={{backgroundColor: 'lightblue'}}>
      {Object.keys(nfts).map(nftID => (
          <div key={nftID}>
              <h1>Price: {nfts[nftID].price}</h1>
              <h1>{nftID}</h1>
              <img style={{width: "100px"}} src={`https://ipfs.infura.io/ipfs/${nfts[nftID].nftRef.ipfsHash}`} />
              <h1>{nfts[nftID].nftRef.metadata.name}</h1>
              <button onClick={() => purchase(nftID)}>Purchase this NFT</button>
          </div>
      ))}
    </div>
  );
}

export default SaleCollection;