module.exports = {
  ////// CONFIGURATION TEMPLATE: uncomment desired lines to override default config.
  ////// While all lines are commented, config will not change anything.
  toolbar: {
    // items: [
    //     "heading",
    //     "|",
    //     "fontFamily",
    //     "fontSize",
    //     "fontColor",
    //     "|",
    //     "bold",
    //     "italic",
    //     "underline",
    //     "strikethrough",
    //     "subscript",
    //     "superscript",
    //     "removeFormat",
    //     "code",
    //     "link",
    //     "bulletedList",
    //     "numberedList",
    //     "todoList",
    //     "insertImage",
    //     "strapiMediaLib",
    //     "|",
    //     "alignment",
    //     "indent",
    //     "outdent",
    //     "|",
    //     "specialCharacters",
    //     "blockQuote",
    //     "insertTable",
    //     "mediaEmbed",
    //     "htmlEmbed",
    //     "codeBlock",
    //     "horizontalLine",
    //     "|",
    //     "fullScreen",
    //     "undo",
    //     "redo",
    // ],
    // shouldNotGroupWhenFull: true
  },
  image: {
    // styles: [
    //     "alignLeft",
    //     "alignCenter",
    //     "alignRight",
    // ],
    // resizeOptions: [
    //     {
    //         name: "resizeImage:original",
    //         value: null,
    //         icon: "original"
    //     },
    //     {
    //         name: "resizeImage:50",
    //         value: "50",
    //         icon: "medium"
    //     },
    //     {
    //         name: "resizeImage:75",
    //         value: "75",
    //         icon: "large"
    //     }
    // ],
    // toolbar: [
    //     "imageStyle:alignLeft",
    //     "imageStyle:alignCenter",
    //     "imageStyle:alignRight",
    //     "|",
    //     "imageTextAlternative",
    //     "|",
    //     "resizeImage:50",
    //     "resizeImage:75",
    //     "resizeImage:original",
    //     "|",
    //     "linkImage",
    // ]
  },
  table: {
    // contentToolbar: [
    //     "tableColumn",
    //     "tableRow",
    //     "mergeTableCells",
    //     "tableProperties",
    //     "tableCellProperties",
    // ]
  },
  heading: {
    options: [
      { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
      {
        model: "heading1",
        view: {
          name: "h1",
          styles: { 'font-size': '46px','margin-bottom': '0',"line-height":"0.8" }
        },
        title: "Heading 1",
        class: "ck-heading_heading1",
      },
      {
        model: "heading2",
        view: {
          name: "h2",
          styles: { 'font-size': '32px','margin-bottom': '6px' }
        },
        title: "Heading 2",
        class: "ck-heading_heading2",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Heading 3",
        class: "ck-heading_heading3",
      },
      {
        model: "heading4",
        view: "h4",
        title: "Heading 4",
        class: "ck-heading_heading4",
      },
    ],
  },
  htmlEmbed: {
    // showPreviews: true,
  },
  fontFamily: {
    // options: [
    //   "default",
    //   "Arial, Helvetica, sans-serif",
    //   "Courier New, Courier, monospace",
    //   "Georgia, serif",
    //   "Lucida Sans Unicode, Lucida Grande, sans-serif",
    //   "Tahoma, Geneva, sans-serif",
    //   "Times New Roman, Times, serif",
    //   "Trebuchet MS, Helvetica, sans-serif",
    //   "Verdana, Geneva, sans-serif",
    //   "JetBrains Mono, monospace",
    //   "Lato, Inter, sans-serif",
    // ],
  },
  link: {
    // defaultProtocol: "http://",
    // decorators: [
    //   {
    //     mode: "manual",
    //     label: "Open in a new tab",
    //     defaultValue: true,
    //     attributes: {
    //       target: "_blank",
    //       rel: "noopener noreferrer",
    //     },
    //   },
    //   {
    //     mode: "manual",
    //     label: "Downloadable",
    //     attributes: {
    //       download: "download",
    //     },
    //   },
    // ],
  },
  fontColor: {
    colors: [
      {
        color: "#000000",
        label: "Black",
      },
      {
        color: "#57534E",
        label: "warm grey",
      },
      {
        color: "#6B7280",
        label: "Grey",
      },
      {
        color: "#EF4444",
        label: "red",
      },
      {
        color: "#FFDF85",
        label: "yellow",
      },
      {
        color: "#FF9D33",
        label: "orange",
      },
      {
        color: "#10B981",
        label: "green",
      },
      {
        color: "#3B82F6",
        label: "blue",
      },
      {
        color: "#EC4899",
        label: "pink",
      },
      {
        color: "#84CC16",
        label: "lime",
      },
      {
        color: "#A855F7",
        label: "purple",
      },
      {
        color: "#ffffff",
        label: "White",
      },
    ],
  },
};
