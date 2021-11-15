import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import { get, isEmpty } from "lodash";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory, useLocation } from "react-router-dom";
import { Header } from "@buffetjs/custom";
import { Flex, Padded } from "@buffetjs/core";
import isEqual from "react-fast-compare";
import { stringify } from "qs";
import {
  CheckPermissions,
  InjectionZone,
  InjectionZoneList,
  PopUpWarning,
  useGlobalContext,
  useQueryParams,
  useUser,
  request,
} from "strapi-helper-plugin";
import pluginId from "../../pluginId";
import pluginPermissions from "../../permissions";
import { formatFiltersFromQuery, getRequestUrl, getTrad } from "../../utils";
import Container from "../../components/Container";
import CustomTable from "../../components/CustomTable";
import FilterPicker from "../../components/FilterPicker";
import Search from "../../components/Search";
import ListViewProvider from "../ListViewProvider";
import { AddFilterCta, FilterIcon, Wrapper } from "./components";
import FieldPicker from "./FieldPicker";
import Filter from "./Filter";
import Footer from "./Footer";
import {
  getData,
  getDataSucceeded,
  onChangeBulk,
  onChangeBulkSelectall,
  onDeleteDataError,
  onDeleteDataSucceeded,
  onDeleteSeveralDataSucceeded,
  setModalLoadingState,
  toggleModalDelete,
  toggleModalDeleteAll,
  exportAll,
  setLayout,
  onChangeListHeaders,
  onResetListHeaders,
} from "./actions";
import makeSelectListView from "./selectors";
import {
  getAllAllowedHeaders,
  getFirstSortableHeader,
  buildQueryString,
} from "./utils";
const {
  Parser,
  transforms: { unwind, flatten },
} = require("json2csv");
var dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

/* eslint-disable react/no-array-index-key */
function ListView({
  canCreate,
  canDelete,
  canRead,
  canUpdate,
  didDeleteData,
  entriesToDelete,
  onChangeBulk,
  onChangeBulkSelectall,
  onDeleteDataError,
  onDeleteDataSucceeded,
  onDeleteSeveralDataSucceeded,
  setModalLoadingState,
  showWarningDelete,
  showModalConfirmButtonLoading,
  showWarningDeleteAll,
  toggleModalDelete,
  toggleModalDeleteAll,
  exportAll,
  data,
  displayedHeaders,
  getData,
  getDataSucceeded,
  isLoading,
  layout,
  onChangeListHeaders,
  onResetListHeaders,
  pagination: { total },
  slug,
}) {
  const {
    contentType: {
      attributes,
      metadatas,
      settings: {
        bulkable: isBulkable,
        filterable: isFilterable,
        searchable: isSearchable,
      },
    },
  } = layout;

  const { emitEvent } = useGlobalContext();
  const { fetchUserPermissions } = useUser();
  const emitEventRef = useRef(emitEvent);
  const fetchPermissionsRef = useRef(fetchUserPermissions);

  const [{ query }, setQuery] = useQueryParams();
  const params = buildQueryString(query);

  const { pathname } = useLocation();
  const { push } = useHistory();
  const { formatMessage } = useIntl();

  const [isFilterPickerOpen, setFilterPickerState] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const contentType = layout.contentType;
  const hasDraftAndPublish = get(contentType, "options.draftAndPublish", false);
  const allAllowedHeaders = useMemo(
    () => getAllAllowedHeaders(attributes),
    [attributes]
  );

  const filters = useMemo(() => {
    return formatFiltersFromQuery(query);
  }, [query]);

  const _sort = query._sort;
  const _q = query._q || "";

  const label = contentType.info.label;

  const firstSortableHeader = useMemo(
    () => getFirstSortableHeader(displayedHeaders),
    [displayedHeaders]
  );

  useEffect(() => {
    setFilterPickerState(false);
  }, []);

  // Using a ref to avoid requests being fired multiple times on slug on change
  // We need it because the hook as mulitple dependencies so it may run before the permissions have checked
  const requestUrlRef = useRef("");

  const fetchData = useCallback(
    async (endPoint, abortSignal = false) => {
      getData();
      const signal = abortSignal || new AbortController().signal;

      try {
        const { results, pagination } = await request(endPoint, {
          method: "GET",
          signal,
        });

        getDataSucceeded(pagination, results);
      } catch (err) {
        const resStatus = get(err, "response.status", null);
        console.log(err);

        if (resStatus === 403) {
          await fetchPermissionsRef.current();

          strapi.notification.info(getTrad("permissions.not-allowed.update"));

          push("/");

          return;
        }

        if (err.name !== "AbortError") {
          console.error(err);
          strapi.notification.error(getTrad("error.model.fetch"));
        }
      }
    },
    [getData, getDataSucceeded, push]
  );

  const handleChangeListLabels = useCallback(
    ({ name, value }) => {
      // Display a notification if trying to remove the last displayed field

      if (value && displayedHeaders.length === 1) {
        strapi.notification.toggle({
          type: "warning",
          message: { id: "content-manager.notification.error.displayedFields" },
        });
      } else {
        emitEventRef.current("didChangeDisplayedFields");

        onChangeListHeaders({ name, value });
      }
    },
    [displayedHeaders, onChangeListHeaders]
  );

  const downloadAsCSV = function (text, opts) {
    var blob = new Blob([opts.bom ? "\ufeff" + text : text]);

    if (window.navigator.msSaveOrOpenBlob) {
      // compat: ie10
      window.navigator.msSaveOrOpenBlob(blob, opts.filename);
    } else {
      var a = document.createElement("a");
      a.setAttribute("href", URL.createObjectURL(blob, { type: opts.mime }));
      a.setAttribute("download", opts.filename);
      a.setAttribute("target", "_blank");
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
      }, 0);
    }
  };

  //  const exportAsCSV = function(arr,opts){
  //     opts = opts || {};
  //     opts.filename = opts.filename || "export.csv";
  //     opts.sep = opts.sep || "auto";
  //     opts.eol = opts.eol || "\r\n";
  //     opts.bom = typeof opts.bom === "boolean" ? opts.bom : true;
  //     opts.quote = opts.quote || '"';
  //     opts.mime = opts.mime || "text/csv;charset=utf-8";

  //     if (opts.sep === "auto") {
  //       if ("toLocaleString" in Number.prototype) {
  //         opts.sep = (1.2).toLocaleString().substring(1, 2) === "," ? ";" : ",";
  //       } else {
  //         opts.sep = ",";
  //       }
  //     }

  //     var quoteRe = new RegExp(opts.quote, "g");
  //     var sepRe = new RegExp(opts.sep, "g");

  //     opts.formatter = opts.formatter || function(value) {
  //       var quoted = false;

  //       if (typeof value !== "string") {
  //         value = JSON.stringify(value) || "";
  //       }

  //       // escape quotes by doubling the quotes and wrapping in quotes
  //       if (quoteRe.test(value)) {
  //         value = opts.quote + value.replace(quoteRe, opts.quote + opts.quote) + opts.quote;
  //         quoted = true;
  //       }

  //       // escape separator by wrapping in quotes
  //       if (sepRe.test(value) && !quoted) {
  //         value = opts.quote + value + opts.quote;
  //       }

  //       return value;
  //     };

  //     // build headers from first element in array
  //     var paths = [];
  //     //move moduleResults to the end of the array
  //     //https://stackoverflow.com/questions/24909371/move-item-in-array-to-last-position
  //     let firstLevelKeys = Object.keys(arr[0]);
  //     // firstLevelKeys.map((elem, index) => {
  //     //   if(elem.toLowerCase() === "moduleResults".toLowerCase()){
  //     //     firstLevelKeys.splice(index, 1);
  //     //     firstLevelKeys.push(elem);
  //     //   }
  //     // })
  //     if(firstLevelKeys.indexOf("moduleResults")>-1)
  //     firstLevelKeys.push(firstLevelKeys.splice(firstLevelKeys.indexOf("moduleResults"), 1)[0]);

  //     (function scan(prefix, obj, keys) {
  //       keys.forEach(function(key) {
  //         var path = prefix ? prefix + "." + key : key;
  //         if (typeof obj[key] === "object" && obj[key] !== null) {
  //           scan(path, obj[key], Object.keys(obj[key]));
  //         } else {
  //           paths.push(opts.formatter(path));
  //         }
  //       });
  //     })(null, arr[0], firstLevelKeys);
  //     var header = paths.join(opts.sep) + opts.eol;

  //     // build body
  //     var body = arr.map(function(obj) {
  //       var row = [];
  //       (function scan(obj, keys) {
  //         if(keys.indexOf("moduleResults")>-1) {
  //           keys.push(keys.splice(keys.indexOf("moduleResults"), 1)[0]);
  //         }
  //         keys.forEach(function(key) {
  //           if (typeof obj[key] === "object" && obj[key] !== null) {
  //             scan(obj[key], Object.keys(obj[key]));
  //           } else {
  //             row.push(opts.formatter(obj[key]));
  //           }
  //         });
  //       })(obj, Object.keys(obj));
  //       return row.join(opts.sep);
  //     }).join(opts.eol);

  //     // build a link and trigger a download
  //     var text = header + body;
  //     downloadAsCSV(text,opts);
  //   }

  const handleExportAllData = useCallback(async () => {
    try {
      if (label == "Templates") {
        // const result = await request(`/${label.toLowerCase()}?id_in=${entriesToDelete.join('&id_in=')}`, {
        //   method: 'GET'
        // });
        // console.log(result);
        const templateResults = await request(
          `/${label.toLowerCase()}?id_in=${entriesToDelete.join("&id_in=")}  `,
          {
            method: "GET",
          }
        );
        const everything = [];
        for (const templateResult of templateResults) {
          const result = await request(
            `/alarms?id_in=${templateResult.alarms
              .map((a) => a.id)
              .join("&id_in=")}`,
            {
              method: "GET",
            }
          );
          if (result.length > 0) {
            // console.log(result);
            // let countMaxResults = 0;
            // results.forEach(result => {
            //   if(result.moduleResults) countMaxResults++;
            // });

            result.forEach((r) => {
              r.user = r.user.email;
              delete r.template.callToAction_button;
              delete r.template.callToAction_text;
              delete r.template.quittierung_text;
              delete r.template.notification_body;
              delete r.template.notification_titel;
              delete r.template.reminder_schedule;
              delete r.template.created_at;
              delete r.template.updated_at;
              delete r.template.published_at;
              if(r.send_at)
              r.send_at = dayjs(r.send_at).format("YYYY-MM-DD HH:mm:ss").toString();
              if(r.opened_at)
              r.opened_at = dayjs(r.opened_at).format("YYYY-MM-DD HH:mm:ss").toString();
              if(r.confirmed_at)
              r.confirmed_at = dayjs(r.confirmed_at).format("YYYY-MM-DD HH:mm:ss").toString();
              if(r.received_at)
              r.received_at = dayjs(r.received_at).format("YYYY-MM-DD HH:mm:ss").toString();

              if(r.moduleResults) {
                //sort moduleResults by module_step and calculate difference between each submitted_at
                r.moduleResults.sort((a,b) => {
                  if(a.module_step > b.module_step) return 1;
                  if(a.module_step < b.module_step) return -1;
                  return 0;
                })
                r.moduleResults.forEach((mr,i) => {
                  if(i == 0) {
                    mr.time_spend = dayjs(mr.submitted_at).diff(dayjs(r.confirmed_at), 'seconds',true);
                  } else {
                    mr.time_spend = dayjs(mr.submitted_at).diff(dayjs(r.moduleResults[i-1].submitted_at), 'seconds',true);
                  }
                })

                // r.moduleResults.forEach((mr) => {
                //   mr.submitted_at = dayjs(mr.submitted_at).format("YYYY-MM-DD HH:mm:ss").toString();
                // })
              }
              if(r.template.ausloesen_um)
              r.template.ausloesen_um = dayjs(r.template.ausloesen_um).format("YYYY-MM-DD HH:mm:ss").toString();
              if(r.template.ausgeloest_um)
              r.template.ausgeloest_um = dayjs(r.template.ausgeloest_um).format("YYYY-MM-DD HH:mm:ss").toString();

              // r.moduleResults = r.moduleResults ? JSON.stringify(r.moduleResults) : 'Keine Ergebnisse';

              //TODO: wenn denormalisierung nicht erwünscht ist
              // kein unwind machen, sondern hier manuell die moduleResults als neue Spalten hinzufügen
            });
            everything.push(...result);
            // exportAsCSV(results,{filename:templateResult.name+'.csv'});
          }
        }
          const fields = [
            { label: "alarm.id", value: "id" },
            "user",
            {
              label: "sent_at",
              value: "send_at",
            },
            "opened_at",
            "confirmed_at",
            "received_at",
            "accelerometerMaximum",
            "accelerometerTotal",
            "template.id",
            "template.ausloesen_um",
            "template.ausgeloest",
            "template.ausgeloest_um",
            "template.fehlalarm",
            "template.brandwahrscheinlichkeit",
            "template.layout",
            "template.randomisierte_module",
            "template.alarmierte_personen",
            "template.gamification_nutzen",
            "template.nfc_nutzen",
            { label: "module.step", value: "moduleResults.moduleStep" },
            { label: "module.id", value: "moduleResults.moduleId" },
            {
              label: "moduleResults.submitted_at",
              value: "moduleResults.submitted_at",
            },
            {
              label: "moduleResults.time_spend",
              value: "moduleResults.time_spend",
            },
            {
              label: "moduleResult.label",
              value: "moduleResults.results.label",
            },
            {
              label: "moduleResult.answer",
              value: "moduleResults.results.answer",
            },
          ];
          const transforms = [
            unwind({ paths: ["moduleResults", "moduleResults.results"] }),
          ];
          // const fields = ['id', 'send_at', 'opened_at','template.id','moduleResults.moduleStep','moduleResults.results'];
          // const transforms = [unwind({ paths: ['moduleResults'] })];
          const json2csvParser = new Parser({
            delimiter: ";",
            quote: "",
            fields,
            transforms,
          });
          console.log(everything);
          const csv = json2csvParser.parse(everything);

          if(templateResults.length > 1)
          downloadAsCSV(csv, { filename: "export.csv" });
          else
          downloadAsCSV(csv, { filename: templateResults[0].name+".csv" });
      }
    } catch (err) {
      strapi.notification.error(err.toString());
    }
  }, [fetchData, entriesToDelete]);

  const handleConfirmDeleteAllData = useCallback(async () => {
    try {
      setModalLoadingState();

      await request(
        getRequestUrl(`collection-types/${slug}/actions/bulkDelete`),
        {
          method: "POST",
          body: { ids: entriesToDelete },
        }
      );

      onDeleteSeveralDataSucceeded();
      emitEventRef.current("didBulkDeleteEntries");
    } catch (err) {
      strapi.notification.error(`${pluginId}.error.record.delete`);
    }
  }, [
    entriesToDelete,
    onDeleteSeveralDataSucceeded,
    slug,
    setModalLoadingState,
  ]);

  const handleConfirmDeleteData = useCallback(async () => {
    try {
      let trackerProperty = {};

      if (hasDraftAndPublish) {
        const dataToDelete = data.find(
          (obj) => obj.id.toString() === idToDelete.toString()
        );
        const isDraftEntry = isEmpty(dataToDelete.published_at);
        const status = isDraftEntry ? "draft" : "published";

        trackerProperty = { status };
      }

      emitEventRef.current("willDeleteEntry", trackerProperty);
      setModalLoadingState();

      await request(getRequestUrl(`collection-types/${slug}/${idToDelete}`), {
        method: "DELETE",
      });

      strapi.notification.toggle({
        type: "success",
        message: { id: `${pluginId}.success.record.delete` },
      });

      // Close the modal and refetch data
      onDeleteDataSucceeded();
      emitEventRef.current("didDeleteEntry", trackerProperty);
    } catch (err) {
      const errorMessage = get(
        err,
        "response.payload.message",
        formatMessage({ id: `${pluginId}.error.record.delete` })
      );

      strapi.notification.toggle({
        type: "warning",
        message: errorMessage,
      });
      // Close the modal
      onDeleteDataError();
    }
  }, [
    hasDraftAndPublish,
    setModalLoadingState,
    slug,
    idToDelete,
    onDeleteDataSucceeded,
    data,
    formatMessage,
    onDeleteDataError,
  ]);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const shouldSendRequest = canRead;
    const requestUrl = `/${pluginId}/collection-types/${slug}${params}`;

    if (shouldSendRequest && requestUrl.includes(requestUrlRef.current)) {
      fetchData(requestUrl, signal);
    }

    return () => {
      requestUrlRef.current = slug;
      abortController.abort();
    };
  }, [canRead, getData, slug, params, getDataSucceeded, fetchData]);

  const handleClickDelete = (id) => {
    setIdToDelete(id);
    toggleModalDelete();
  };

  const handleModalClose = useCallback(() => {
    if (didDeleteData) {
      const requestUrl = `/${pluginId}/collection-types/${slug}${params}`;

      fetchData(requestUrl);
    }
  }, [fetchData, didDeleteData, slug, params]);

  const toggleFilterPickerState = useCallback(() => {
    setFilterPickerState((prevState) => {
      if (!prevState) {
        emitEventRef.current("willFilterEntries");
      }

      return !prevState;
    });
  }, []);

  const headerAction = useMemo(() => {
    if (!canCreate) {
      return [];
    }

    return [
      {
        label: formatMessage(
          {
            id: "content-manager.containers.List.addAnEntry",
          },
          {
            entity: label || "Content Manager",
          }
        ),
        onClick: () => {
          const trackerProperty = hasDraftAndPublish ? { status: "draft" } : {};

          emitEventRef.current("willCreateEntry", trackerProperty);
          push({
            pathname: `${pathname}/create`,
            search: query.plugins
              ? stringify({ plugins: query.plugins }, { encode: false })
              : "",
          });
        },
        color: "primary",
        type: "button",
        icon: true,
        style: {
          paddingLeft: 15,
          paddingRight: 15,
          fontWeight: 600,
        },
      },
    ];
  }, [
    label,
    pathname,
    canCreate,
    formatMessage,
    hasDraftAndPublish,
    push,
    query,
  ]);

  const headerProps = useMemo(() => {
    /* eslint-disable indent */
    return {
      title: {
        label: label || "Content Manager",
      },
      content: canRead
        ? formatMessage(
            {
              id:
                total > 1
                  ? `${pluginId}.containers.List.pluginHeaderDescription`
                  : `${pluginId}.containers.List.pluginHeaderDescription.singular`,
            },
            { label: total }
          )
        : null,
      actions: headerAction,
    };
  }, [total, headerAction, label, canRead, formatMessage]);

  const handleToggleModalDeleteAll = (e) => {
    emitEventRef.current("willBulkDeleteEntries");
    toggleModalDeleteAll(e);
  };

  const handleExportAll = (e) => {
    handleExportAllData(e);
  };

  return (
    <>
      <ListViewProvider
        _q={_q}
        _sort={_sort}
        data={data}
        entriesToDelete={entriesToDelete}
        filters={filters}
        firstSortableHeader={firstSortableHeader}
        label={label}
        onChangeBulk={onChangeBulk}
        onChangeBulkSelectall={onChangeBulkSelectall}
        onClickDelete={handleClickDelete}
        slug={slug}
        toggleModalDeleteAll={handleToggleModalDeleteAll}
        exportAll={handleExportAll}
        setQuery={setQuery}
      >
        <FilterPicker
          contentType={contentType}
          filters={filters}
          isOpen={isFilterPickerOpen}
          metadatas={metadatas}
          name={label}
          toggleFilterPickerState={toggleFilterPickerState}
          setQuery={setQuery}
          slug={slug}
        />
        <Container className="container-fluid">
          {!isFilterPickerOpen && (
            <Header {...headerProps} isLoading={isLoading && canRead} />
          )}
          {isSearchable && canRead && (
            <Search
              changeParams={setQuery}
              initValue={_q}
              model={label}
              value={_q}
            />
          )}

          {!canRead && (
            <Flex justifyContent="flex-end">
              <Padded right size="sm">
                <InjectionZone area={`${pluginId}.listView.actions`} />
              </Padded>
            </Flex>
          )}

          {canRead && (
            <Wrapper>
              <div className="row" style={{ marginBottom: "5px" }}>
                <div className="col-9">
                  <div
                    className="row"
                    style={{ marginLeft: 0, marginRight: 0 }}
                  >
                    {isFilterable && (
                      <>
                        <AddFilterCta
                          type="button"
                          onClick={toggleFilterPickerState}
                        >
                          <FilterIcon />
                          <FormattedMessage id="app.utils.filters" />
                        </AddFilterCta>
                        {filters.map(
                          ({ filter: filterName, name, value }, key) => (
                            <Filter
                              contentType={contentType}
                              filterName={filterName}
                              filters={filters}
                              index={key}
                              key={key}
                              metadatas={metadatas}
                              name={name}
                              toggleFilterPickerState={toggleFilterPickerState}
                              isFilterPickerOpen={isFilterPickerOpen}
                              setQuery={setQuery}
                              value={value}
                            />
                          )
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="col-3">
                  <Flex justifyContent="flex-end">
                    <Padded right size="sm">
                      <InjectionZone area={`${pluginId}.listView.actions`} />
                    </Padded>

                    <CheckPermissions
                      permissions={
                        pluginPermissions.collectionTypesConfigurations
                      }
                    >
                      <FieldPicker
                        displayedHeaders={displayedHeaders}
                        items={allAllowedHeaders}
                        onChange={handleChangeListLabels}
                        onClickReset={onResetListHeaders}
                        slug={slug}
                      />
                    </CheckPermissions>
                  </Flex>
                </div>
              </div>
              <div className="row" style={{ paddingTop: "12px" }}>
                <div className="col-12">
                  <CustomTable
                    data={data}
                    canCreate={canCreate}
                    canDelete={canDelete}
                    canUpdate={canUpdate}
                    displayedHeaders={displayedHeaders}
                    hasDraftAndPublish={hasDraftAndPublish}
                    isBulkable={isBulkable}
                    setQuery={setQuery}
                    showLoader={isLoading}
                  />
                  <Footer count={total} params={query} onChange={setQuery} />
                </div>
              </div>
            </Wrapper>
          )}
        </Container>
        <PopUpWarning
          isOpen={showWarningDelete}
          toggleModal={toggleModalDelete}
          content={{
            message: getTrad("popUpWarning.bodyMessage.contentType.delete"),
          }}
          onConfirm={handleConfirmDeleteData}
          popUpWarningType="danger"
          onClosed={handleModalClose}
          isConfirmButtonLoading={showModalConfirmButtonLoading}
        >
          <InjectionZoneList
            area={`${pluginId}.listView.deleteModalAdditionalInfos`}
          />
        </PopUpWarning>
        <PopUpWarning
          isOpen={showWarningDeleteAll}
          toggleModal={toggleModalDeleteAll}
          content={{
            message: getTrad(
              `popUpWarning.bodyMessage.contentType.delete${
                entriesToDelete.length > 1 ? ".all" : ""
              }`
            ),
          }}
          popUpWarningType="danger"
          onConfirm={handleConfirmDeleteAllData}
          onClosed={handleModalClose}
          isConfirmButtonLoading={showModalConfirmButtonLoading}
        >
          <InjectionZoneList
            area={`${pluginId}.listView.deleteModalAdditionalInfos`}
          />
        </PopUpWarning>
      </ListViewProvider>
    </>
  );
}

ListView.defaultProps = {
  permissions: [],
};

ListView.propTypes = {
  canCreate: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
  canRead: PropTypes.bool.isRequired,
  canUpdate: PropTypes.bool.isRequired,
  displayedHeaders: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  didDeleteData: PropTypes.bool.isRequired,
  entriesToDelete: PropTypes.array.isRequired,
  layout: PropTypes.exact({
    components: PropTypes.object.isRequired,
    contentType: PropTypes.shape({
      attributes: PropTypes.object.isRequired,
      metadatas: PropTypes.object.isRequired,
      info: PropTypes.shape({ label: PropTypes.string.isRequired }).isRequired,
      layouts: PropTypes.shape({
        list: PropTypes.array.isRequired,
        editRelations: PropTypes.array,
      }).isRequired,
      options: PropTypes.object.isRequired,
      settings: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
  getData: PropTypes.func.isRequired,
  getDataSucceeded: PropTypes.func.isRequired,
  onChangeBulk: PropTypes.func.isRequired,
  onChangeBulkSelectall: PropTypes.func.isRequired,
  onChangeListHeaders: PropTypes.func.isRequired,
  onDeleteDataError: PropTypes.func.isRequired,
  onDeleteDataSucceeded: PropTypes.func.isRequired,
  onDeleteSeveralDataSucceeded: PropTypes.func.isRequired,
  onResetListHeaders: PropTypes.func.isRequired,
  pagination: PropTypes.shape({ total: PropTypes.number.isRequired })
    .isRequired,
  setModalLoadingState: PropTypes.func.isRequired,
  showModalConfirmButtonLoading: PropTypes.bool.isRequired,
  showWarningDelete: PropTypes.bool.isRequired,
  showWarningDeleteAll: PropTypes.bool.isRequired,
  slug: PropTypes.string.isRequired,
  toggleModalDelete: PropTypes.func.isRequired,
  toggleModalDeleteAll: PropTypes.func.isRequired,
  exportAll: PropTypes.func.isRequired,
  setLayout: PropTypes.func.isRequired,
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      action: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired,
      properties: PropTypes.object,
      conditions: PropTypes.arrayOf(PropTypes.string),
    })
  ),
};

const mapStateToProps = makeSelectListView();

export function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getData,
      getDataSucceeded,
      onChangeBulk,
      onChangeBulkSelectall,
      onChangeListHeaders,
      onDeleteDataError,
      onDeleteDataSucceeded,
      onDeleteSeveralDataSucceeded,
      onResetListHeaders,
      setModalLoadingState,
      toggleModalDelete,
      exportAll,
      toggleModalDeleteAll,
      setLayout,
    },
    dispatch
  );
}
const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(memo(ListView, isEqual));
