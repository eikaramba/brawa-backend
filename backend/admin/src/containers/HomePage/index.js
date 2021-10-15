/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React, { memo, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { get, upperFirst } from 'lodash';
import { auth, LoadingIndicatorPage } from 'strapi-helper-plugin';
import PageTitle from '../../components/PageTitle';
import { useModels } from '../../hooks';

import useFetch from './hooks';
import { ALink, Block, Container, LinkWrapper, P, Wave, Separator } from './components';
import BlogPost from './BlogPost';
import SocialLink from './SocialLink';

const FIRST_BLOCK_LINKS = [
  {
    link:
      'https://strapi.io/documentation/developer-docs/latest/getting-started/quick-start.html#_4-create-a-category-content-type',
    contentId: 'app.components.BlockLink.documentation.content',
    titleId: 'app.components.BlockLink.documentation',
  },
  {
    link: 'https://github.com/strapi/foodadvisor',
    contentId: 'app.components.BlockLink.code.content',
    titleId: 'app.components.BlockLink.code',
  },
];

const HomePage = ({ history: { push } }) => {
  // Temporary until we develop the menu API
  const { isLoading: isLoadingForModels } = useModels();

  if (isLoadingForModels) {
    return <LoadingIndicatorPage />;
  }

  const headerId = 'HomePage.greetings';
  const username = get(auth.getUserInfo(), 'firstname', '');

  return (
    <>
      <FormattedMessage id="HomePage.helmet.title">
        {title => <PageTitle title={title} />}
      </FormattedMessage>
      <Container className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-md-12">
            <Block>
              <Wave />
              <FormattedMessage
                id={headerId}
                values={{
                  name: upperFirst(username),
                }}
              >
                {msg => <h2 id="mainHeader">{msg}</h2>}
              </FormattedMessage>

              <p>Willkommen im Admin Bereich des BRAWA Projektes. Hier können die Alarme konfiguriert werden, welche die Nutzer erhalten.</p>

              
              <Separator style={{ marginTop: 37, marginBottom: 36 }} />

              <h2 style={{  marginBottom: 12 }} >Kurze Einführung</h2>
              <p>
                Links gibt es <strong>Sammlungen</strong>. Dort können zunächst unter Groups die Nutzergruppen definiert und die Nutzer zugeordnet werden.
              </p>
              <p>
                Danach sind vorallem die sogennanten <strong>Templates</strong> wichtig. Mit diesen wird eine Art Blauplan der Alarme definiert. Z.b. kann definiert werden wann die Welle an Alarmen gesendet werden soll. An welche Nutzergruppen. Aber auch inhaltliche Aspekte wie Texte oder Layouts werden hier definiert.
              </p>

              <p>Die eigentlichen ausgelösten Alarme findet man dann unter <strong>Alarms</strong>. Hier werden vorallem die Ergebnisse eines individuellen Alarms für einen Nutzer permanent gespeichert. Z.b. Messergebnisse wie wann auf die Notification geklickt worden ist, oder aber auch welche Fragen wie beantwortet worden sind.
              </p>

              <h2 style={{  marginBottom: 12,marginTop: 12 }} >Wie können die Daten als CSV exportiert werden?</h2>
              <p>Um Alarme zu exportieren, klickt man zunächst auf "Templates". Dort können dann die Templates für die ein Export stattfinden soll selektiert werden. Danach klickt man auf den erscheinenden "Export as CSV" Button. Für jedes markierte Template wird genau eine CSV Datei mit den ausgelösten Alarmen exportiert.</p>


            </Block>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);
