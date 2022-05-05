import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Button, Popover, Select } from 'antd';
import {
  ENDPOINTS,
  formatNumber,
  formatUSD,
  Identicon,
  MetaplexModal,
  Settings,
  shortenAddress,
  useConnectionConfig,
  useNativeAccount,
  useWalletModal,
  useQuerySearch,
  WRAPPED_SOL_MINT,
} from '@oyster/common';
import { useMeta, useSolPrice } from '../../contexts';
import { useTokenList } from '../../contexts/tokenList';
import { TokenCircle } from '../Custom';

('@solana/wallet-adapter-base');

const btnStyle: React.CSSProperties = {
  border: 'none',
  height: 40,
};

const UserActions = (props: { mobile?: boolean; onClick?: any }) => {
  const { publicKey } = useWallet();
  const { whitelistedCreatorsByCreator, store } = useMeta();
  const pubkey = publicKey?.toBase58() || '';

  const canCreate = useMemo(() => {
    return (
      store?.info?.public ||
      whitelistedCreatorsByCreator[pubkey]?.info?.activated
    );
  }, [pubkey, whitelistedCreatorsByCreator, store]);

  return (
    <>
      {store &&
        (props.mobile ? (
          <div className="actions-buttons actions-user">
            {canCreate && (
              <Link to={`/art/create`}>
                <Button
                  onClick={() => {
                    props.onClick ? props.onClick() : null;
                  }}
                  className="black-btn"
                >
                  Create
                </Button>
              </Link>
            )}
            <Link to={`/auction/create/0`}>
              <Button
                onClick={() => {
                  props.onClick ? props.onClick() : null;
                }}
                className="black-btn"
              >
                Sell
              </Button>
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
            }}
          >
            {canCreate && (
              <>
                <Link to={`/art/create`} style={{ width: '100%' }}>
                  <Button className="metaplex-button-default" style={btnStyle}>
                    Create
                  </Button>
                </Link>
                &nbsp;&nbsp;
              </>
            )}
            <Link to={`/auction/create/0`} style={{ width: '100%' }}>
              <Button className="metaplex-button-default" style={btnStyle}>
                Sell
              </Button>
            </Link>
          </div>
        ))}
    </>
  );
};

const AddFundsModal = (props: {
  showAddFundsModal: any;
  setShowAddFundsModal: any;
  balance: number;
  publicKey: PublicKey;
}) => {
  return (
    <MetaplexModal
      visible={props.showAddFundsModal}
      onCancel={() => props.setShowAddFundsModal(false)}
      title="Add Funds"
      bodyStyle={{
        alignItems: 'start',
      }}
    >
      <div style={{ maxWidth: '100%' }}>
        <p style={{ color: 'white' }}>
          We partner with <b>FTX</b> to make it simple to start purchasing
          digital collectibles.
        </p>
        <div
          style={{
            width: '100%',
            background: '#242424',
            borderRadius: 12,
            marginBottom: 10,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            justifyContent: 'space-between',
            fontWeight: 700,
          }}
        >
          <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Balance</span>
          <span>
            {formatNumber.format(props.balance)}&nbsp;&nbsp;
            <span
              style={{
                borderRadius: '50%',
                background: 'black',
                display: 'inline-block',
                padding: '1px 4px 4px 4px',
                lineHeight: 1,
              }}
            >
              <img src="/sol.svg" width="10" />
            </span>{' '}
            SOL
          </span>
        </div>
        <p>
          If you have not used FTX Pay before, it may take a few moments to get
          set up.
        </p>
        <Button
          onClick={() => props.setShowAddFundsModal(false)}
          style={{
            background: '#454545',
            borderRadius: 14,
            width: '30%',
            padding: 10,
            height: 'auto',
          }}
        >
          Close
        </Button>
        <Button
          onClick={() => {
            window.open(
              `https://ftx.com/pay/request?coin=SOL&address=${props.publicKey?.toBase58()}&tag=&wallet=sol&memoIsRequired=false`,
              '_blank',
              'resizable,width=680,height=860',
            );
          }}
          style={{
            background: 'black',
            borderRadius: 14,
            width: '68%',
            marginLeft: '2%',
            padding: 10,
            height: 'auto',
            borderColor: 'black',
          }}
        >
          <div
            style={{
              display: 'flex',
              placeContent: 'center',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              fontSize: 16,
            }}
          >
            <span style={{ marginRight: 5 }}>Sign with</span>
            <img src="/ftxpay.png" width="80" />
          </div>
        </Button>
      </div>
    </MetaplexModal>
  );
};

export const CurrentUserBadge = (props: {
  showBalance?: boolean;
  showAddress?: boolean;
  iconSize?: number;
}) => {
  const { wallet, publicKey, disconnect } = useWallet();
  const { account } = useNativeAccount();
  const solPrice = useSolPrice();
  const [showAddFundsModal, setShowAddFundsModal] = useState<Boolean>(false);
  const tokenList = useTokenList();

  if (!wallet || !publicKey) {
    return null;
  }
  const balance = (account?.lamports || 0) / LAMPORTS_PER_SOL;
  const balanceInUSD = balance * solPrice;
  const solMintInfo = tokenList.tokenMap.get(WRAPPED_SOL_MINT.toString());
  const iconStyle: React.CSSProperties = {
    display: 'flex',
    width: props.iconSize,
    borderRadius: 50,
  };

  let name = props.showAddress ? shortenAddress(`${publicKey}`) : '';
  const unknownWallet = wallet as any;
  if (unknownWallet.name && !props.showAddress) {
    name = unknownWallet.name;
  }

  // let image = <Identicon address={publicKey?.toBase58()} style={iconStyle} />
  let image = <img src='https://w1.pngwing.com/pngs/407/851/png-transparent-wallet-icon-wallet-ethereum-share-icon-coin-purse-zipper-computer-software-black.png'
  alt='Wallet_logo'
  style={{"height":"30px","width":"32px", "borderRadius":28}}
  />;

  if (unknownWallet.image) {
    image = <img src='data:image/jpeg;base64,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' style={iconStyle} />;
  }

  return (
    <div className="wallet-wrapper">
      {props.showBalance && (
        <span>
          {formatNumber.format((account?.lamports || 0) / LAMPORTS_PER_SOL)} SOL
        </span>
      )}

      <Popover
        trigger="click"
        placement="bottomRight"
        content={
          <Settings
            additionalSettings={
              <div
                style={{
                  width: 250,
                }}
              >
                <h5
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    letterSpacing: '0.02em',
                  }}
                >
                  BALANCE
                </h5>
                <div
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <TokenCircle
                    iconFile={solMintInfo ? solMintInfo.logoURI : ''}
                  />
                  &nbsp;
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    {formatNumber.format(balance)} SOL
                  </span>
                  &nbsp;
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {formatUSD.format(balanceInUSD)}
                  </span>
                  &nbsp;
                </div>
                <div
                  style={{
                    display: 'flex',
                    marginBottom: 10,
                  }}
                >
                  <Button
                    className="metaplex-button-default"
                    onClick={() => setShowAddFundsModal(true)}
                    style={btnStyle}
                  >
                    Add Funds
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    className="metaplex-button-default"
                    onClick={disconnect}
                    style={btnStyle}
                  >
                    Disconnect
                  </Button>
                </div>
                <UserActions />
              </div>
            }
          />
        }
      >
        <Button className="wallet-key">
          {image}
          {name && (
            <span
              style={{
                marginLeft: '0.5rem',
                fontWeight: 600,
              }}
            >
              {name}
            </span>
          )}
        </Button>
      </Popover>
      <AddFundsModal
        setShowAddFundsModal={setShowAddFundsModal}
        showAddFundsModal={showAddFundsModal}
        publicKey={publicKey}
        balance={balance}
      />
    </div>
  );
};

export const Cog = () => {
  const { endpoint } = useConnectionConfig();
  const routerSearchParams = useQuerySearch();
  const { setVisible } = useWalletModal();
  const open = useCallback(() => setVisible(true), [setVisible]);

  return (
    <div className="wallet-wrapper">
      <Popover
        trigger="click"
        placement="bottomRight"
        content={
          <div
            style={{
              width: 250,
            }}
          >
            <h5
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '0.02em',
              }}
            >
              NETWORK
            </h5>
            <Select
              onSelect={network => {
                // Reload the page, forward user selection to the URL querystring.
                // The app will be re-initialized with the correct network
                // (which will also be saved to local storage for future visits)
                // for all its lifecycle.

                // Because we use react-router's HashRouter, we must append
                // the query parameters to the window location's hash & reload
                // explicitly. We cannot update the window location's search
                // property the standard way, see examples below.

                // doesn't work: https://localhost/?network=devnet#/
                // works: https://localhost/#/?network=devnet
                const windowHash = window.location.hash;
                routerSearchParams.set('network', network);
                const nextLocationHash = `${
                  windowHash.split('?')[0]
                }?${routerSearchParams.toString()}`;
                window.location.hash = nextLocationHash;
                window.location.reload();
              }}
              value={endpoint.name}
              bordered={false}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
                width: '100%',
                marginBottom: 10,
              }}
            >
              {ENDPOINTS.map(({ name }) => (
                <Select.Option value={name} key={endpoint.name}>
                  {name}
                </Select.Option>
              ))}
            </Select>

            <Button
              className="metaplex-button-default"
              style={btnStyle}
              onClick={open}
            >
              Change wallet
            </Button>
          </div>
        }
      >
        <Button className="wallet-key">
          {/* <img src="/cog.svg" /> */}
          <img src='https://e7.pngegg.com/pngimages/1013/351/png-clipart-cryptocurrency-wallet-bitcoin-digital-wallet-data-key-bitcoin-television-rectangle.png'
          alt='wallet_key'
          style={{"height":"34px", "width":"39px" ,"color":"yellow","borderRadius":29}}/>
        </Button>
      </Popover>
    </div>
  );
};

export const CurrentUserBadgeMobile = (props: {
  showBalance?: boolean;
  showAddress?: boolean;
  iconSize?: number;
  closeModal?: any;
}) => {
  const { wallet, publicKey, disconnect } = useWallet();
  const { account } = useNativeAccount();
  const solPrice = useSolPrice();

  const [showAddFundsModal, setShowAddFundsModal] = useState<Boolean>(false);

  if (!wallet || !publicKey) {
    return null;
  }
  const balance = (account?.lamports || 0) / LAMPORTS_PER_SOL;
  const balanceInUSD = balance * solPrice;

  const iconStyle: React.CSSProperties = {
    display: 'flex',
    width: props.iconSize,
    borderRadius: 50,
  };

  let name = props.showAddress ? shortenAddress(`${publicKey}`) : '';
  const unknownWallet = wallet as any;
  if (unknownWallet.name && !props.showAddress) {
    name = unknownWallet.name;
  }

  let image = <Identicon address={publicKey?.toBase58()} style={iconStyle} />;

  if (unknownWallet.image) {
    image = <img src={unknownWallet.image} style={iconStyle} />;
  }

  return (
    <div className="current-user-mobile-badge">
      <div className="mobile-badge">
        {image}
        {name && (
          <span
            style={{
              marginLeft: '0.5rem',
              fontWeight: 600,
            }}
          >
            {name}
          </span>
        )}
      </div>
      <div className="balance-container">
        <span className="balance-title">Balance</span>
        <span>
          <span className="sol-img-wrapper">
            <img src="/sol.svg" width="10" />
          </span>{' '}
          {formatNumber.format(balance)}&nbsp;&nbsp; SOL{' '}
          <span
            style={{
              marginLeft: 5,
              fontWeight: 'normal',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {formatUSD.format(balanceInUSD)}
          </span>
        </span>
      </div>
      <div className="actions-buttons">
        <Button
          className="secondary-btn"
          onClick={() => {
            props.closeModal ? props.closeModal() : null;
            setShowAddFundsModal(true);
          }}
        >
          Add Funds
        </Button>
        &nbsp;&nbsp;
        <Button className="black-btn" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
      <div className="actions-buttons">
        <UserActions
          mobile
          onClick={() => {
            props.closeModal ? props.closeModal() : null;
          }}
        />
      </div>
      <AddFundsModal
        setShowAddFundsModal={setShowAddFundsModal}
        showAddFundsModal={showAddFundsModal}
        publicKey={publicKey}
        balance={balance}
      />
    </div>
  );
};
