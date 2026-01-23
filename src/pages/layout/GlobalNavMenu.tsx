import React, {useState} from "react";
import {
  Box,
  IconButton,
  Modal,
  Slide,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HeadingBigSvg from "../../assets/svg/heading-big.svg?react";

// Grid icon for trigger button
const GridIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.26609 0H4.59424C5.29017 0 5.86033 0.570158 5.86033 1.26609V4.59424C5.86033 5.29017 5.29017 5.86033 4.59424 5.86033H1.26609C0.570158 5.86033 0 5.29017 0 4.59424V1.26609C0 0.571075 0.571075 0 1.26609 0ZM9.33639 0H12.6645C13.3605 0 13.9306 0.570158 13.9306 1.26609V4.59424C13.9306 5.29017 13.3605 5.86033 12.6645 5.86033H9.33639C8.64047 5.86033 8.07031 5.29017 8.07031 4.59424V1.26609C8.07031 0.568301 8.63772 0 9.33639 0ZM1.26609 8.07031H4.59424C5.29017 8.07031 5.86033 8.64047 5.86033 9.33639V12.6645C5.86033 13.3605 5.28925 13.9306 4.59424 13.9306L1.26609 13.9297C0.570158 13.9297 0 13.3596 0 12.6636V9.33642C0 8.64049 0.571075 8.07031 1.26609 8.07031ZM9.33639 8.07031H12.6645C13.3605 8.07031 13.9306 8.64047 13.9306 9.33639V12.6645C13.9306 13.3605 13.3596 13.9306 12.6645 13.9306L9.33639 13.9297C8.63861 13.9297 8.07031 13.3614 8.07031 12.6636V9.33642C8.07031 8.63771 8.63772 8.07031 9.33639 8.07031ZM17.4058 0H20.7339C21.4298 0 22 0.570158 22 1.26609V4.59424C22 5.29017 21.4298 5.86033 20.7339 5.86033H17.4058C16.7107 5.86033 16.1397 5.29017 16.1397 4.59424V1.26609C16.1397 0.568301 16.708 0 17.4058 0ZM17.4058 8.07031H20.7339C21.4298 8.07031 22 8.64047 22 9.33639V12.6645C22 13.3605 21.4298 13.9306 20.7339 13.9306H17.4058C16.708 13.9306 16.1397 13.3623 16.1397 12.6645V9.33639C16.1397 8.63769 16.708 8.07031 17.4058 8.07031ZM1.26609 16.1397H4.59424C5.29017 16.1397 5.86033 16.7098 5.86033 17.4058V20.7339C5.86033 21.4298 5.28925 22 4.59424 22H1.26609C0.570158 22 0 21.4298 0 20.7339V17.4058C0 16.708 0.568325 16.1397 1.26609 16.1397ZM9.33639 16.1397H12.6645C13.3605 16.1397 13.9306 16.7098 13.9306 17.4058V20.7339C13.9306 21.4298 13.3596 22 12.6645 22H9.33639C8.63861 22 8.07031 21.4317 8.07031 20.7339V17.4058C8.07031 16.7107 8.64047 16.1397 9.33639 16.1397ZM17.4058 16.1397H20.7339C21.4298 16.1397 22 16.7098 22 17.4058V20.7339C22 21.4298 21.4298 22 20.7339 22H17.4058C16.708 22 16.1397 21.4317 16.1397 20.7339V17.4058C16.1397 16.7107 16.7107 16.1397 17.4058 16.1397Z"
    />
  </svg>
);

// Product icons
const BridgeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    viewBox="0 0 46 46"
    fill="none"
  >
    <g clipPath="url(#clip0_bridge)">
      <path
        d="M45.7055 12.2184H45.7143V8.41663C44.2637 7.93167 42.6022 7.23022 40.8264 6.28628C40.8264 6.28628 40.8176 6.27762 40.8176 6.26896V4.14726C40.8176 3.95674 40.6769 3.80952 40.5011 3.80952H37.8637C37.6879 3.80952 37.5473 3.9654 37.5473 4.14726V6.68464C37.5473 6.68464 37.5473 6.70196 37.5385 6.70196C34.9978 7.97497 32.7297 8.70241 31.0154 9.12675C27.4901 9.99275 24.6945 10.0101 22.8484 10.0101C21.0022 10.0101 18.2154 9.99275 14.6813 9.12675C12.967 8.70241 10.7077 7.97497 8.15824 6.70196C8.15824 6.70196 8.14945 6.6933 8.14945 6.68464V4.15592C8.14945 3.9654 8 3.80952 7.82418 3.80952H5.2044C5.02857 3.80952 4.87912 3.9654 4.87912 4.15592V6.2603C4.87912 6.2603 4.87912 6.27762 4.87033 6.27762C3.12088 7.23022 1.45934 7.91435 0.00879121 8.40797C0.00879121 8.40797 0 8.40797 0 8.41663C0 8.58117 0 11.9845 0 12.2097C0 12.2184 0 12.2184 0.0175824 12.2097C0.518681 12.0538 1.06374 11.8633 1.62637 11.6555V25.0698H0.0175824C0.0175824 25.0698 0 25.0698 0 25.0871V28.5944C0 28.5944 0 28.6117 0.0175824 28.6117H4.87912C4.87912 28.6117 4.8967 28.6117 4.8967 28.629V38.3368C4.8967 38.3368 4.8967 38.3542 4.87912 38.3542H3.5956C3.41099 38.3542 3.26154 38.5187 3.26154 38.7179V41.541C3.26154 41.7402 3.4022 41.8961 3.58681 41.8961C4.72088 41.8961 8.35165 41.8961 9.47692 41.8961C9.65275 41.8961 9.79341 41.7402 9.79341 41.5497C9.79341 40.7616 9.79341 38.8911 9.79341 38.8911C9.79341 38.51 9.64396 38.3542 9.45934 38.3542H8.17582C8.17582 38.3542 8.15824 38.3542 8.15824 38.3368V28.629C8.15824 28.629 8.15824 28.6117 8.17582 28.6117H37.5297C37.5297 28.6117 37.5473 28.6117 37.5473 28.629V38.3368C37.5473 38.3368 37.5473 38.3542 37.5297 38.3542H36.2813C36.0791 38.3542 35.9121 38.536 35.9121 38.7525V41.541C35.9121 41.7402 36.0615 41.9048 36.2462 41.9048C37.389 41.9048 41.0022 41.9048 42.1275 41.9048C42.3033 41.9048 42.444 41.7489 42.444 41.5584C42.444 40.7703 42.444 38.9344 42.444 38.9344C42.444 38.536 42.2769 38.3628 42.0747 38.3628H40.8264C40.8264 38.3628 40.8088 38.3628 40.8088 38.3455V28.6377C40.8088 28.6377 40.8088 28.6204 40.8264 28.6204H45.6879C45.6879 28.6204 45.7055 28.6204 45.7055 28.603V25.0957C45.7055 25.0957 45.7055 25.0784 45.6879 25.0784H44.5978V11.8546C44.9758 11.9845 45.3451 12.1058 45.6967 12.2184H45.7055Z"
        fill="#776100"
      />
    </g>
    <defs>
      <clipPath id="clip0_bridge">
        <rect width="45.7143" height="45.7143" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const DelegatedStakingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    viewBox="0 0 46 46"
    fill="none"
  >
    <path
      d="M41.9043 9.52344C41.9043 16.8871 35.6213 22.8572 27.8701 22.8574H25.8643V24.7617H35.8896V38.0957C35.8897 40.2002 36.1001 41.9043 33.8848 41.9043H13.835C11.6196 41.9043 11.8291 40.2003 11.8291 38.0957V24.7617H21.8545V19.0479C21.8545 11.6841 28.1383 5.71391 35.8896 5.71387H41.9043V9.52344ZM17.8447 30V33.334H21.8545V36.667H17.8447V40H21.8555V36.667H25.8652V33.334H21.8555V30H17.8447ZM25.8652 36.667V40H29.875V36.667H25.8652ZM13.835 33.334V36.667H17.8447V33.334H13.835ZM29.875 33.334V36.667H33.8848V33.334H29.875ZM25.8652 30V33.334H29.875V30H25.8652ZM13.835 26.667V30H17.8447V26.667H13.835ZM29.875 26.667V30H33.8848V26.667H29.875ZM10.8271 3.80957C15.8977 3.8096 20.3807 6.19247 23.1055 9.8457C21.0604 12.4 19.8496 15.5908 19.8496 19.0479V20.9521H18.8467C10.5422 20.9519 3.80976 14.5562 3.80957 6.66699V3.80957H10.8271Z"
      fill="#368A5C"
    />
  </svg>
);

const ParthenonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    viewBox="0 0 46 46"
    fill="none"
  >
    <path
      d="M11.3371 9.25257C11.2503 9.25257 11.1634 9.23886 11.0811 9.21143H11.072C11.072 9.21143 11.0537 9.20229 11.0446 9.19772C11.0217 9.18857 10.9943 9.17943 10.9623 9.16114H10.9531C10.8434 9.10171 10.7474 9.01943 10.6743 8.91886C10.4503 8.62171 10.4503 8.21029 10.6743 7.91314C10.7657 7.79429 10.8891 7.69829 11.0309 7.64343H11.0446C11.0857 7.62057 11.1177 7.61143 11.1406 7.60686H11.168C11.2229 7.59314 11.2777 7.584 11.3371 7.584C11.6754 7.584 11.9589 7.47886 12.1554 7.28229C12.3383 7.09943 12.4343 6.848 12.4297 6.55543V5.51314H10.3589V6.19886C10.3589 6.33143 10.3589 6.46857 10.3589 6.60114C10.3589 6.87086 10.208 7.24114 9.92457 7.33714C9.74629 7.39657 9.52229 7.30972 9.33029 7.328C9.17486 7.34629 9.024 7.40114 8.88686 7.48343C8.61714 7.65257 8.43886 7.94057 8.40229 8.256C8.38857 8.37943 8.39771 8.46629 8.40229 8.53486C8.40686 8.608 8.41143 8.63086 8.384 8.704C8.33372 8.84572 8.224 8.97829 8.07771 9.07886C7.93143 9.17943 7.76229 9.22971 7.60686 9.22971H7.57943C7.41943 9.22971 7.25486 9.17486 7.10857 9.07886C6.96229 8.97829 6.85257 8.84572 6.80229 8.704C6.77486 8.63086 6.77943 8.608 6.784 8.53486C6.78857 8.47086 6.79771 8.37943 6.784 8.256C6.74743 7.94057 6.56914 7.65257 6.29943 7.48343C6.16686 7.40114 6.016 7.34629 5.856 7.328C5.664 7.30514 5.44457 7.39657 5.26171 7.33714C4.97829 7.24114 4.82743 6.87543 4.82743 6.60114C4.82743 6.46857 4.82743 6.33143 4.82743 6.19886V5.51314H2.75657V6.55543C2.75657 6.848 2.848 7.09943 3.03086 7.28229C3.22743 7.47886 3.51086 7.584 3.84914 7.584C3.904 7.584 3.96343 7.58857 4.01829 7.60229H4.04571C4.06857 7.61143 4.10057 7.62057 4.14171 7.63886H4.15543C4.29714 7.69829 4.42057 7.79429 4.512 7.91314C4.74057 8.21029 4.74057 8.62171 4.512 8.91886C4.43886 9.01486 4.34286 9.09714 4.23314 9.152H4.224C4.19657 9.17486 4.16914 9.184 4.14171 9.19314C4.13257 9.19314 4.12343 9.19771 4.11429 9.20229H4.10514C4.02286 9.22971 3.936 9.24343 3.84914 9.24343C3.19086 9.24343 2.752 9.64571 2.752 10.2446C2.752 10.7109 2.96686 10.9577 3.14514 11.0766C3.36457 11.2229 3.62971 11.2686 3.88114 11.2914H3.89943C3.968 11.3006 4.02286 11.3143 4.08686 11.3371L4.11886 11.3509H4.12343C4.29257 11.4103 4.43429 11.5291 4.52571 11.6846C4.576 11.7714 4.61257 11.8903 4.62171 12.0137C4.62629 12.064 4.63086 12.1097 4.63543 12.1554C4.63543 12.192 4.64 12.2286 4.64457 12.2697V37.0469H6.70171V12.1189C6.70171 11.8446 6.59657 11.5794 6.40457 11.3874C6.39543 11.3783 6.39086 11.3737 6.38171 11.3691C6.368 11.3554 6.35429 11.3417 6.34057 11.3326H6.33143C6.10743 11.1314 5.81943 11.1269 5.60914 11.1269C5.57257 11.1269 5.54057 11.1269 5.50857 11.1269H5.47657L5.408 11.1086L5.344 11.0903L5.27543 11.0629C5.20229 11.0309 5.13371 10.9851 5.07429 10.9349L5.06057 10.9211C4.86857 10.752 4.77257 10.5371 4.768 10.2766C4.768 10.0891 4.82743 9.91086 4.94171 9.76C5.05143 9.61372 5.20686 9.50857 5.38057 9.45371C5.55429 9.40343 5.88343 9.39886 6.04343 9.45371C6.33143 9.54514 6.53714 9.81029 6.55086 10.112C6.55086 10.1349 6.55086 10.1623 6.55086 10.1943C6.55086 10.2811 6.54171 10.4046 6.592 10.5554C6.73829 10.9806 7.136 11.2686 7.584 11.2686C8.03657 11.2686 8.43429 10.9806 8.576 10.5554C8.62629 10.4046 8.62171 10.2811 8.61714 10.1943C8.61714 10.1623 8.61714 10.1394 8.61714 10.112C8.63543 9.81029 8.83657 9.54514 9.12457 9.45371C9.28457 9.40343 9.60914 9.40343 9.78743 9.45371C9.96114 9.504 10.1166 9.61372 10.2263 9.76C10.3406 9.91086 10.4 10.0846 10.4 10.2766C10.4 10.5371 10.2994 10.752 10.1074 10.9211L10.0937 10.9349C10.0343 10.9851 9.96571 11.0263 9.89257 11.0629L9.824 11.0903L9.76 11.1086L9.69143 11.1223H9.65943C9.632 11.1269 9.59543 11.1314 9.55886 11.1314C9.34857 11.1314 9.056 11.1406 8.83657 11.3326H8.82743C8.82743 11.3326 8.8 11.36 8.78629 11.3737C8.77714 11.3783 8.77257 11.3874 8.76343 11.392C8.57143 11.584 8.46629 11.8491 8.46629 12.1234V37.0606H10.5234V12.2834C10.5234 12.2423 10.528 12.2057 10.5326 12.1691C10.5326 12.1234 10.5371 12.0777 10.5463 12.0274C10.56 11.904 10.592 11.7897 10.6423 11.6983C10.7291 11.5429 10.8754 11.424 11.0446 11.3646H11.0491L11.0811 11.3509C11.1451 11.328 11.2046 11.3143 11.2686 11.3051H11.2869C11.5383 11.2823 11.8034 11.2366 12.0229 11.0903C12.2011 10.9669 12.416 10.7246 12.416 10.2583C12.416 9.65943 11.9771 9.25714 11.3189 9.25714L11.3371 9.25257Z"
      fill="#67420E"
    />
    <path d="M25.6823 0H20.1646V5.51771H25.6823V0Z" fill="#67420E" />
    <path d="M40.8777 0H35.36V5.51771H40.8777V0Z" fill="#67420E" />
    <path d="M10.3543 0H4.83657V5.51771H10.3543V0Z" fill="#67420E" />
  </svg>
);

const ExplorerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    viewBox="0 0 46 46"
    fill="none"
  >
    <g clipPath="url(#clip0_explorer)">
      <path
        d="M18.5713 0C19.0508 0 19.5226 0.121676 19.9424 0.353516L35.6572 8.95215C36.1067 9.19811 36.4818 9.56028 36.7432 10.001C37.0045 10.4417 37.1423 10.9446 37.1426 11.457V20.8369C40.4152 22.6428 42.6337 26.1272 42.6338 30.127L42.625 30.5762C42.5382 32.6798 41.8228 34.7093 40.5732 36.4043L45.4355 41.2646L43.1699 43.5303L38.3096 38.668C36.6145 39.9176 34.5852 40.6329 32.4814 40.7197L32.0312 40.7295C28.941 40.7294 26.1592 39.4045 24.2207 37.293L19.9424 39.6357C19.5226 39.8676 19.0509 39.9893 18.5713 39.9893C18.0917 39.9892 17.62 39.8677 17.2002 39.6357L1.48535 31.0342C1.03676 30.7887 0.66266 30.4269 0.401367 29.9873C0.140048 29.5476 0.00118492 29.0457 0 28.5342V11.4551C0.0012317 10.9437 0.140092 10.4416 0.401367 10.002C0.662676 9.56242 1.03678 9.20054 1.48535 8.95508L17.2002 0.353516C17.62 0.121622 18.0917 2.35968e-05 18.5713 0ZM32.0312 22.251C27.6814 22.251 24.1553 25.7771 24.1553 30.127C24.1553 34.288 27.382 37.6923 31.4697 37.9805C31.471 37.9806 31.4723 37.9814 31.4736 37.9814C31.5531 37.987 31.6328 37.9919 31.7129 37.9951C31.8185 37.9997 31.9246 38.0039 32.0312 38.0039C35.7102 38.0039 38.7993 35.4809 39.665 32.0713C39.6926 31.9629 39.7174 31.8538 39.7402 31.7441C39.7438 31.7269 39.7475 31.7097 39.751 31.6924C39.7887 31.5054 39.8217 31.317 39.8457 31.127C39.8877 30.797 39.9087 30.4631 39.9082 30.127C39.9082 30.0002 39.9039 29.8742 39.8975 29.749C39.7002 25.5746 36.2545 22.251 32.0312 22.251Z"
        fill="white"
        fillOpacity="0.48"
      />
    </g>
    <defs>
      <clipPath id="clip0_explorer">
        <rect width="45.7143" height="45.7143" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const MoveDocsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    viewBox="0 0 46 46"
    fill="none"
  >
    <g clipPath="url(#clip0_movedocs)">
      <path
        d="M22.8593 5.90914C23.5607 5.63704 24.3538 5.66559 25.076 5.90231L43.9374 12.205C45.412 12.7004 45.6945 15.3332 43.9374 16.1904C42.179 17.0482 24.8085 26.0894 24.1522 26.2089C22.8594 26.5707 22.4959 26.4939 21.2831 26.1699C19.6914 25.7446 2.34752 19.1186 2.29773 19.0996L2.27429 21.6103L20.3973 28.4726C22.1417 29.1352 23.8634 29.1644 25.5487 28.3164L43.1307 19.2021L45.0712 18.0888C45.6267 18.6281 45.7012 19.4708 45.6942 20.2138C45.6837 21.446 45.0672 22.188 44.0673 22.6992C44.0301 22.7183 26.7667 31.6085 24.9813 32.3447C23.7302 32.8595 22.2533 32.779 20.994 32.3691C19.3376 31.8298 2.30066 25.1474 2.30066 25.1474L2.27527 27.7666L20.8417 34.9804C22.4599 35.6088 24.1894 35.4322 25.7069 34.6318L44.3251 24.8115L45.1151 24.3935L45.1161 24.3945C45.8326 25.4402 45.9127 26.8271 45.327 27.9375C45.0145 28.5292 44.4328 28.8573 43.8622 29.1757C43.8005 29.2103 26.3582 38.9845 24.9208 39.6093C23.3825 40.2791 21.7055 40.0165 20.1835 39.3662L1.53113 31.3974C0.622756 31.0082 0.0115635 30.2311 0.0125732 29.1845L0.0184326 25.3466C0.0196105 24.5048 0.471964 23.8272 1.14441 23.3867C0.445548 22.9596 -0.00475103 22.2447 -0.00012207 21.3701L0.0194092 17.7949C0.0252527 16.7883 0.611324 16.0515 1.46667 15.6464L22.8593 5.90914Z"
        fill="#859DFF"
      />
    </g>
    <defs>
      <clipPath id="clip0_movedocs">
        <rect width="45.7143" height="45.7143" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

// Product icons mapping
const productIcons: Record<string, React.FC> = {
  bridge: BridgeIcon,
  "delegated-staking": DelegatedStakingIcon,
  parthenon: ParthenonIcon,
  explorer: ExplorerIcon,
  "move-docs": MoveDocsIcon,
};

// Gradient backgrounds for product icons
const iconGradients: Record<string, string> = {
  bridge:
    "linear-gradient(130deg, rgba(255, 234, 144, 1) 24%, rgba(255, 217, 53, 1) 79%)",
  "delegated-staking":
    "linear-gradient(130deg, rgba(0, 255, 249, 1) 34%, rgba(129, 255, 186, 1) 79%)",
  parthenon:
    "linear-gradient(135deg, rgba(175, 133, 73, 1) 15%, rgba(251, 230, 123, 1) 38%, rgba(252, 251, 231, 1) 53%, rgba(247, 209, 78, 1) 70%, rgba(212, 160, 65, 1) 86%)",
  explorer:
    "linear-gradient(131deg, rgba(255, 102, 66, 1) 4%, rgba(200, 62, 30, 1) 96%)",
  "move-docs":
    "linear-gradient(129deg, rgba(51, 92, 255, 1) 28%, rgba(3, 55, 255, 1) 96%)",
};

// Navigation item type
export interface NavMenuItem {
  id: string;
  title: string;
  description: string;
  href?: string;
}

// Default navigation items
const defaultNavItems: NavMenuItem[] = [
  {
    id: "bridge",
    title: "BRIDGE",
    description:
      "Move assets seamlessly across chains with secure, high-performance cross-chain transfers.",
    href: "https://bridge.movementnetwork.xyz/",
  },
  {
    id: "delegated-staking",
    title: "DELEGATED STAKING",
    description:
      "Earn rewards by delegating your stake to validators securing the Movement network.",
    href: "https://staking.movementnetwork.xyz/",
  },
  {
    id: "parthenon",
    title: "PARTHENON",
    description:
      "Register and manage human-readable names for wallets, apps, and on-chain identities.",
    href: "https://parthenon.movementlabs.xyz/",
  },
  {
    id: "explorer",
    title: "EXPLORER",
    description:
      "Inspect blocks, transactions, and on-chain activity in real time across the Movement network.",
    href: "https://explorer.movementnetwork.xyz/?network=mainnet",
  },
  {
    id: "move-docs",
    title: "MOVE DOCS",
    description:
      "Explore official documentation, guides, and references for building on Movement.",
    href: "https://docs.movementnetwork.xyz/general",
  },
];

interface ProductBlockProps {
  item: NavMenuItem;
}

function ProductBlock({item}: ProductBlockProps) {
  const IconComponent = productIcons[item.id] || BridgeIcon;
  const gradient = iconGradients[item.id] || iconGradients.bridge;

  const handleClick = () => {
    if (item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        gap: 2.5,
        alignItems: "flex-start",
        p: 2,
        borderRadius: "4px",
        width: "100%",
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.08)",
        },
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Icon container with gradient background */}
      <Box
        sx={{
          flexShrink: 0,
          width: 64,
          height: 64,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: gradient,
        }}
      >
        <IconComponent />
      </Box>

      {/* Text content */}
      <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 1}}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "#fff",
            letterSpacing: "0.05em",
            lineHeight: 1.4,
          }}
        >
          {item.title}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "rgba(255, 255, 255, 0.6)",
            lineHeight: 1.6,
          }}
        >
          {item.description}
        </Typography>
      </Box>
    </Box>
  );
}

interface GlobalNavMenuProps {
  items?: NavMenuItem[];
}

export default function GlobalNavMenu({
  items = defaultNavItems,
}: GlobalNavMenuProps) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const leftItems = items.slice(0, 3);
  const rightItems = items.slice(3, 6);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Trigger button */}
      <IconButton
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          color: "#fff",
          ml: 1,
          "&:hover": {
            color: "#81ffba",
          },
        }}
        aria-label="Open navigation menu"
      >
        <GridIcon />
      </IconButton>

      {/* Modal with Slide animation */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
            },
          },
        }}
      >
        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: "#000",
              color: "#fff",
              maxHeight: isMobile ? "100vh" : "auto",
              height: isMobile ? "100vh" : "auto",
              overflowY: "auto",
              outline: "none",
            }}
          >
            {/* Close button */}
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 24,
                right: 24,
                color: "#fff",
                zIndex: 10,
                "&:hover": {
                  opacity: 1,
                },
                opacity: 0.7,
              }}
              aria-label="Close menu"
            >
              <CloseIcon sx={{fontSize: 24}} />
            </IconButton>

            {isMobile ? (
              // Mobile layout
              <Box
                sx={{
                  minHeight: "100vh",
                  bgcolor: "#000",
                }}
              >
                {/* Header with branding */}
                <Box
                  sx={{
                    pt: 3,
                    pb: 2,
                    px: 3,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <HeadingBigSvg style={{height: 40, width: "auto"}} />
                </Box>

                {/* Apps section */}
                <Box sx={{px: 3, pb: 5}}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: "1.125rem",
                      color: "#fff",
                      letterSpacing: "0.05em",
                      mb: 2,
                    }}
                  >
                    APPS
                  </Typography>
                  <Box sx={{display: "flex", flexDirection: "column"}}>
                    {items.map((item) => (
                      <ProductBlock key={item.id} item={item} />
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              // Desktop layout
              <Box sx={{minHeight: 600, bgcolor: "#000"}}>
                {/* Header with branding */}
                <Box
                  sx={{
                    height: 104,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HeadingBigSvg style={{height: 64, width: "auto"}} />
                </Box>

                {/* Main content */}
                <Box sx={{px: 5, pb: 5}}>
                  <Box sx={{display: "flex", gap: 5}}>
                    {/* Apps columns */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flex: {md: 1, xl: "none"},
                        justifyContent: {md: "center", xl: "flex-start"},
                      }}
                    >
                      {/* Left apps column */}
                      <Box sx={{flex: {md: 1, xl: "none"}, maxWidth: 356}}>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: "1.125rem",
                            color: "#fff",
                            letterSpacing: "0.05em",
                            mb: 2,
                          }}
                        >
                          APPS
                        </Typography>
                        <Box sx={{display: "flex", flexDirection: "column"}}>
                          {leftItems.map((item) => (
                            <ProductBlock key={item.id} item={item} />
                          ))}
                        </Box>
                      </Box>

                      {/* Right apps column */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          flex: {md: 1, xl: "none"},
                          maxWidth: 345,
                        }}
                      >
                        <Box sx={{height: 47}} /> {/* Spacer */}
                        {rightItems.map((item) => (
                          <ProductBlock key={item.id} item={item} />
                        ))}
                      </Box>
                    </Box>

                    {/* Right section - Video and Alliance */}
                    <Box
                      sx={{
                        display: {xs: "none", xl: "flex"},
                        flex: 1,
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      {/* Video section */}
                      <Box
                        sx={{
                          width: 384,
                          height: 224,
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <iframe
                          width="384"
                          height="224"
                          src="https://www.youtube.com/embed/vl6qoOeGRL0"
                          title="Movement Labs"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                          }}
                        />
                      </Box>

                      {/* Move Alliance section */}
                      <Box sx={{width: 400}}>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: "1.125rem",
                            color: "#fff",
                            letterSpacing: "0.05em",
                            mb: 1,
                          }}
                        >
                          INTRODUCING MOVE ALLIANCE
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: "rgba(255, 255, 255, 0.6)",
                            lineHeight: 1.6,
                          }}
                        >
                          This first-of-its-kind ecosystem flywheel fuses{" "}
                          <Box
                            component="a"
                            href="https://x.com/search?q=%24MOVE&src=cashtag_click"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: "inherit",
                              textDecoration: "underline",
                            }}
                          >
                            MOVE
                          </Box>{" "}
                          buybacks with performance incentives that benefits the
                          builders, the community, and the Movement network.{" "}
                          <Box
                            component="span"
                            sx={{
                              color: "#81ffba",
                              textDecoration: "underline dotted",
                              cursor: "pointer",
                            }}
                          >
                            more
                          </Box>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Slide>
      </Modal>
    </>
  );
}
