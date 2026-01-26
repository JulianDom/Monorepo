import svgPaths from "./svg-xt4tx1lxel";

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.p27fe8680} fill="var(--fill-0, #737373)" />
            <path d={svgPaths.p25cfa000} fill="var(--fill-0, #737373)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function DecorationLeft() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center p-[2px] relative shrink-0 w-[20px]" data-name="Decoration left">
      <Icon />
    </div>
  );
}

function Al() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-px items-center min-h-px min-w-px relative" data-name="AL">
      <p className="css-ew64yg font-['Geist:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#737373] text-[14px]">Search by name or email</p>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white min-h-[36px] relative rounded-[8px] shrink-0 w-[320px]" data-name="Input">
      <div className="content-stretch flex gap-[8px] items-center min-h-[inherit] overflow-clip px-[12px] py-[7.5px] relative rounded-[inherit] w-full">
        <DecorationLeft />
        <Al />
      </div>
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Tab() {
  return (
    <div className="bg-white content-stretch flex gap-[6px] items-center justify-center min-h-[29px] min-w-[29px] px-[8px] py-[4px] relative rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0" data-name="Tab">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[14px]">
        <p className="css-ew64yg leading-[20px]">Favorited</p>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center min-h-[29px] min-w-[29px] px-[8px] py-[4px] relative rounded-[10px] shrink-0" data-name="Tab">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[14px]">
        <p className="css-ew64yg leading-[20px]">All</p>
      </div>
    </div>
  );
}

function Tabs() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex items-center p-[3px] relative rounded-[10px] shrink-0" data-name="Tabs">
      <Tab />
      <Tab1 />
    </div>
  );
}

function LeftIcon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Left icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Left icon">
          <path d={svgPaths.p1582aef0} fill="var(--fill-0, #0A0A0A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <LeftIcon />
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">Filters</p>
      </div>
    </div>
  );
}

function Al1() {
  return (
    <div className="content-stretch flex gap-[26px] items-center relative shrink-0" data-name="AL">
      <Input />
      <Tabs />
      <Button />
    </div>
  );
}

function LeftIcon1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Left icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Left icon">
          <g id="Vector">
            <path d={svgPaths.p31d4ac80} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p3e981f80} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p33a56e00} fill="var(--fill-0, #0A0A0A)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <LeftIcon1 />
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">Download CSV</p>
      </div>
    </div>
  );
}

function Al2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="AL">
      <Al1 />
      <Button1 />
    </div>
  );
}

function TableHeader() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] items-center ml-[33.09px] mt-0 p-[8px] relative row-1 w-[206.825px]" data-name="Table Header">
      <p className="css-ew64yg font-['Geist:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#0a0a0a] text-[14px]">Table heading</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function IconArrowUpDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon / arrow-up-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon / arrow-up-down" opacity="0.5">
          <g id="Vector">
            <path d={svgPaths.p37572280} fill="var(--fill-0, #525252)" />
            <path d={svgPaths.p29f70f80} fill="var(--fill-0, #525252)" />
            <path d={svgPaths.p10cb0572} fill="var(--fill-0, #525252)" />
            <path d={svgPaths.p3fb71600} fill="var(--fill-0, #525252)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function TableHeader1() {
  return (
    <div className="bg-[#fafafa] col-1 content-stretch flex gap-[8px] items-center ml-[239.92px] mt-0 p-[8px] relative row-1 w-[206.825px]" data-name="Table Header">
      <p className="css-ew64yg font-['Geist:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#0a0a0a] text-[14px]">Table heading</p>
      <IconArrowUpDown />
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableHeader2() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] items-center justify-end ml-[446.74px] mt-0 p-[8px] relative row-1 w-[206.825px]" data-name="Table Header">
      <p className="css-ew64yg font-['Geist:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#0a0a0a] text-[14px]">Table heading</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableHeader3() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] items-center justify-end ml-[653.57px] mt-0 p-[8px] relative row-1 w-[206.825px]" data-name="Table Header">
      <p className="css-ew64yg font-['Geist:Medium',sans-serif] font-medium leading-[20px] relative shrink-0 text-[#0a0a0a] text-[14px]">Table heading</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableHeader4() {
  return (
    <div className="col-1 content-stretch flex items-center ml-[860.39px] mt-0 px-[8px] py-[7.5px] relative row-1 w-[139.607px]" data-name="Table Header">
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.39px]" data-name="Line" />
    </div>
  );
}

function Checkbox() {
  return (
    <div className="absolute left-[8px] size-[16px] top-1/2 translate-y-[-50%]" data-name="Checkbox">
      <div className="absolute bg-white left-px rounded-[4px] size-[14px] top-px" data-name="Background">
        <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-[-1px] pointer-events-none rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  );
}

function TableHeader5() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] items-center ml-0 mt-0 px-[8px] py-[10px] relative row-1 w-[33.092px]" data-name="Table Header">
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[0.09px]" data-name="Line" />
      <Checkbox />
    </div>
  );
}

function HeadingRow() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Heading row">
      <TableHeader />
      <TableHeader1 />
      <TableHeader2 />
      <TableHeader3 />
      <TableHeader4 />
      <TableHeader5 />
    </div>
  );
}

function Al3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="AL">
      <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center min-h-[36px] min-w-[36px] overflow-clip p-[8px] relative rounded-[8px] shrink-0" data-name="Icon 1">
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
          <div className="absolute inset-[42.71%_13.54%]" data-name="Vector">
            <div className="absolute inset-0" style={{ "--fill-0": "rgba(10, 10, 10, 1)" } as React.CSSProperties}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 2.33333">
                <g id="Vector">
                  <path d={svgPaths.p8c0fe00} fill="var(--fill-0, #0A0A0A)" />
                  <path d={svgPaths.p377ace00} fill="var(--fill-0, #0A0A0A)" />
                  <path d={svgPaths.p35d3300} fill="var(--fill-0, #0A0A0A)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="Avatar">
      <div className="absolute bg-[#f5f5f5] left-1/2 rounded-[9999px] size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Background" />
      <div className="absolute flex flex-col font-['Geist:Semibold',sans-serif] justify-center leading-[0] left-[16px] not-italic size-[32px] text-[#0a0a0a] text-[14px] text-center top-[16px] translate-x-[-50%] translate-y-[-50%]">
        <p className="css-4hzbpn leading-[20px]">CN</p>
      </div>
    </div>
  );
}

function TableCell() {
  return (
    <div className="absolute content-stretch flex gap-[8px] inset-[0_76.01%_0_3.31%] items-center px-[8px] py-[2px]" data-name="Table Cell">
      <Avatar />
      <p className="css-ew64yg font-['Geist:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#0a0a0a] text-[14px]">Name</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell1() {
  return (
    <div className="absolute content-stretch flex gap-[8px] inset-[0_55.33%_0_23.99%] items-center px-[8px] py-[7.5px]" data-name="Table Cell">
      <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px]">Table cell</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell2() {
  return (
    <div className="absolute content-stretch flex gap-[8px] inset-[0_34.64%_0_44.67%] items-center justify-end px-[8px] py-[7.5px]" data-name="Table Cell">
      <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px] text-right">Table cell</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell3() {
  return (
    <div className="absolute content-stretch flex gap-[8px] inset-[0_13.96%_0_65.36%] items-center justify-end px-[8px] py-[7.5px]" data-name="Table Cell">
      <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px] text-right">Table cell</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[6px] items-center justify-center min-h-[32px] px-[12px] py-[6px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">Edit</p>
      </div>
    </div>
  );
}

function TableCell4() {
  return (
    <div className="absolute content-stretch flex gap-[8px] inset-[0_5.69%_0_86.04%] items-center px-[8px] py-[2px]" data-name="Table Cell">
      <Button2 />
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.27px]" data-name="Line" />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.pff644c0} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p26997e00} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p11a24000} fill="var(--fill-0, #0A0A0A)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center min-h-[36px] min-w-[36px] overflow-clip p-[8px] relative rounded-[8px] shrink-0" data-name="Icon 1">
      <Icon2 />
    </div>
  );
}

function Al4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="AL">
      <Icon1 />
    </div>
  );
}

function TableCell5() {
  return (
    <div className="absolute content-stretch flex gap-[8px] inset-[0_0_0_94.31%] items-center justify-end px-[8px]" data-name="Table Cell">
      <Al4 />
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.12px]" data-name="Line" />
    </div>
  );
}

function Checkbox1() {
  return (
    <div className="absolute left-[8px] size-[16px] top-1/2 translate-y-[-50%]" data-name="Checkbox">
      <div className="absolute bg-white left-px rounded-[4px] size-[14px] top-px" data-name="Background">
        <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-[-1px] pointer-events-none rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  );
}

function TableCell6() {
  return (
    <div className="absolute content-stretch flex gap-[8px] inset-[0_96.69%_0_0] items-center px-[8px] py-[10px]" data-name="Table Cell">
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[0.09px]" data-name="Line" />
      <Checkbox1 />
    </div>
  );
}

function Row() {
  return (
    <div className="h-[44px] relative shrink-0 w-[1000px]" data-name=".Row">
      <TableCell />
      <TableCell1 />
      <TableCell2 />
      <TableCell3 />
      <TableCell4 />
      <TableCell5 />
      <TableCell6 />
    </div>
  );
}

function Avatar1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="Avatar">
      <div className="absolute bg-[#f5f5f5] left-1/2 rounded-[9999px] size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Background" />
      <div className="absolute flex flex-col font-['Geist:Semibold',sans-serif] justify-center leading-[0] left-[16px] not-italic size-[32px] text-[#0a0a0a] text-[14px] text-center top-[16px] translate-x-[-50%] translate-y-[-50%]">
        <p className="css-4hzbpn leading-[20px]">CN</p>
      </div>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="bg-[#e5e5e5] col-1 content-stretch flex gap-[8px] h-[44px] items-center ml-[33.09px] mt-0 px-[8px] py-[2px] relative row-1 w-[206.825px]" data-name="Table Cell">
      <Avatar1 />
      <p className="css-ew64yg font-['Geist:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#0a0a0a] text-[14px]">Name</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell8() {
  return (
    <div className="bg-[#e5e5e5] col-1 content-stretch flex gap-[8px] h-[44px] items-center ml-[239.92px] mt-0 px-[8px] py-[7.5px] relative row-1 w-[206.825px]" data-name="Table Cell">
      <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px]">Table cell</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell9() {
  return (
    <div className="bg-[#e5e5e5] col-1 content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[446.74px] mt-0 px-[8px] py-[7.5px] relative row-1 w-[206.825px]" data-name="Table Cell">
      <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px] text-right">Table cell</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function TableCell10() {
  return (
    <div className="bg-[#e5e5e5] col-1 content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[653.57px] mt-0 px-[8px] py-[7.5px] relative row-1 w-[206.825px]" data-name="Table Cell">
      <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px] text-right">Table cell</p>
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.17px]" data-name="Line" />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[6px] items-center justify-center min-h-[32px] px-[12px] py-[6px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">Edit</p>
      </div>
    </div>
  );
}

function TableCell11() {
  return (
    <div className="bg-[#e5e5e5] col-1 content-stretch flex gap-[8px] h-[44px] items-center ml-[860.39px] mt-0 px-[8px] py-[2px] relative row-1 w-[82.73px]" data-name="Table Cell">
      <Button3 />
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.27px]" data-name="Line" />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.p3a5544f0} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p1a97900} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p179b9200} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p7ec4700} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p20996180} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p1cbdf300} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p1dcd9d00} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p38bfdf80} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p36a49280} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p2c6f9600} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p2d34420} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p1e760700} fill="var(--fill-0, #0A0A0A)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Icon4() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center min-h-[36px] min-w-[36px] overflow-clip p-[8px] relative rounded-[8px] shrink-0" data-name="Icon 1">
      <Icon3 />
    </div>
  );
}

function Al5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="AL">
      <Icon4 />
    </div>
  );
}

function TableCell12() {
  return (
    <div className="bg-[#e5e5e5] col-1 content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[943.12px] mt-0 px-[8px] relative row-1 w-[56.877px]" data-name="Table Cell">
      <Al5 />
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[-0.12px]" data-name="Line" />
    </div>
  );
}

function IconCheck() {
  return (
    <div className="absolute left-px size-[14px] top-px" data-name="Icon / check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon / check">
          <path d={svgPaths.p14d2b340} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Checkbox">
      <div className="absolute bg-[#171717] left-0 rounded-[4px] size-[16px] top-0" data-name="Background">
        <div aria-hidden="true" className="absolute border border-[#171717] border-solid inset-[-1px] pointer-events-none rounded-[5px]" />
      </div>
      <IconCheck />
    </div>
  );
}

function TableCell13() {
  return (
    <div className="bg-[#e5e5e5] col-1 content-stretch flex gap-[8px] h-[44px] items-center ml-0 mt-0 px-[8px] py-[10px] relative row-1 w-[33.092px]" data-name="Table Cell">
      <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-[0.09px]" data-name="Line" />
      <Checkbox2 />
    </div>
  );
}

function Row1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Row">
      <TableCell7 />
      <TableCell8 />
      <TableCell9 />
      <TableCell10 />
      <TableCell11 />
      <TableCell12 />
      <TableCell13 />
    </div>
  );
}

function Avatar2() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="Avatar">
      <div className="absolute bg-[#f5f5f5] left-1/2 rounded-[9999px] size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Background" />
      <div className="absolute flex flex-col font-['Geist:Semibold',sans-serif] justify-center leading-[0] left-[16px] not-italic size-[32px] text-[#0a0a0a] text-[14px] text-center top-[16px] translate-x-[-50%] translate-y-[-50%]">
        <p className="css-4hzbpn leading-[20px]">CN</p>
      </div>
    </div>
  );
}

function TableCell14() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] h-[44px] items-center ml-[33.09px] mt-0 px-[8px] py-[2px] relative row-1 w-[206.825px]" data-name="Table Cell">
      <Avatar2 />
      <p className="css-ew64yg font-['Geist:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#0a0a0a] text-[14px]">Name</p>
    </div>
  );
}

function TableCell15() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] h-[44px] items-center ml-[239.92px] mt-0 px-[8px] py-[7.5px] relative row-1 w-[206.825px]" data-name="Table Cell">
      <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px]">Table cell</p>
    </div>
  );
}

function TableCell16() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[446.74px] mt-0 px-[8px] py-[7.5px] relative row-1 w-[206.825px]" data-name="Table Cell">
      <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px] text-right">Table cell</p>
    </div>
  );
}

function TableCell17() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[653.57px] mt-0 px-[8px] py-[7.5px] relative row-1 w-[206.825px]" data-name="Table Cell">
      <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px] text-right">Table cell</p>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[6px] items-center justify-center min-h-[32px] px-[12px] py-[6px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">Edit</p>
      </div>
    </div>
  );
}

function TableCell18() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] h-[44px] items-center ml-[860.39px] mt-0 px-[8px] py-[2px] relative row-1 w-[82.73px]" data-name="Table Cell">
      <Button4 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.p3a5544f0} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p1a97900} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p179b9200} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p7ec4700} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p20996180} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p1cbdf300} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p1dcd9d00} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p38bfdf80} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p36a49280} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p2c6f9600} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p2d34420} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p1e760700} fill="var(--fill-0, #0A0A0A)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Icon6() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex items-center justify-center min-h-[36px] min-w-[36px] overflow-clip p-[8px] relative rounded-[8px] shrink-0" data-name="Icon 1">
      <Icon5 />
    </div>
  );
}

function Al6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="AL">
      <Icon6 />
    </div>
  );
}

function TableCell19() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] h-[44px] items-center justify-end ml-[943.12px] mt-0 px-[8px] relative row-1 w-[56.877px]" data-name="Table Cell">
      <Al6 />
    </div>
  );
}

function Checkbox3() {
  return (
    <div className="absolute left-[8px] size-[16px] top-1/2 translate-y-[-50%]" data-name="Checkbox">
      <div className="absolute bg-white left-px rounded-[4px] size-[14px] top-px" data-name="Background">
        <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-[-1px] pointer-events-none rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      </div>
    </div>
  );
}

function TableCell20() {
  return (
    <div className="col-1 content-stretch flex gap-[8px] h-[44px] items-center ml-0 mt-0 px-[8px] py-[10px] relative row-1 w-[33.092px]" data-name="Table Cell">
      <Checkbox3 />
    </div>
  );
}

function Row2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0" data-name="Row">
      <TableCell14 />
      <TableCell15 />
      <TableCell16 />
      <TableCell17 />
      <TableCell18 />
      <TableCell19 />
      <TableCell20 />
    </div>
  );
}

function Table() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Table">
      <HeadingRow />
      <div className="h-[44px] relative shrink-0 w-[1000px]" data-name=".Row">
        <div className="absolute content-stretch flex gap-[8px] inset-[0_76.01%_0_3.31%] items-center px-[8px] py-[2px]" data-name="Table Cell">
          <div className="overflow-clip relative shrink-0 size-[32px]" data-name="Avatar">
            <div className="absolute bg-[#f5f5f5] left-1/2 rounded-[9999px] size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Background" />
            <div className="absolute flex flex-col font-['Geist:Semibold',sans-serif] justify-center leading-[0] left-[16px] not-italic size-[32px] text-[#0a0a0a] text-[14px] text-center top-[16px] translate-x-[-50%] translate-y-[-50%]">
              <p className="css-4hzbpn leading-[20px]">CN</p>
            </div>
          </div>
          <p className="css-ew64yg font-['Geist:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#0a0a0a] text-[14px]">Name</p>
          <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute content-stretch flex gap-[8px] inset-[0_55.33%_0_23.99%] items-center px-[8px] py-[7.5px]" data-name="Table Cell">
          <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px]">Table cell</p>
          <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute content-stretch flex gap-[8px] inset-[0_34.64%_0_44.67%] items-center justify-end px-[8px] py-[7.5px]" data-name="Table Cell">
          <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px] text-right">Table cell</p>
          <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute content-stretch flex gap-[8px] inset-[0_13.96%_0_65.36%] items-center justify-end px-[8px] py-[7.5px]" data-name="Table Cell">
          <p className="css-4hzbpn flex-[1_0_0] font-['Geist:Regular',sans-serif] font-normal leading-[20px] min-h-px min-w-px relative text-[#0a0a0a] text-[14px] text-right">Table cell</p>
          <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute content-stretch flex gap-[8px] inset-[0_5.69%_0_86.04%] items-center px-[8px] py-[2px]" data-name="Table Cell">
          <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[6px] items-center justify-center min-h-[32px] px-[12px] py-[6px] relative rounded-[8px] shrink-0" data-name="Button">
            <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[14px] text-center">
              <p className="css-ew64yg leading-[20px]">Edit</p>
            </div>
          </div>
          <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute content-stretch flex gap-[8px] inset-[0_0_0_94.31%] items-center justify-end px-[8px]" data-name="Table Cell">
          <Al3 />
          <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-0" data-name="Line" />
        </div>
        <div className="absolute content-stretch flex gap-[8px] inset-[0_96.69%_0_0] items-center px-[8px] py-[10px]" data-name="Table Cell">
          <div className="absolute bg-[#e5e5e5] bottom-0 h-px left-0 right-0" data-name="Line" />
          <div className="absolute left-[8px] size-[16px] top-1/2 translate-y-[-50%]" data-name="Checkbox">
            <div className="absolute bg-white left-px rounded-[4px] size-[14px] top-px" data-name="Background">
              <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-[-1px] pointer-events-none rounded-[5px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
            </div>
          </div>
        </div>
      </div>
      {[...Array(8).keys()].map((_, i) => (
        <Row key={i} />
      ))}
      <Row1 />
      <Row2 />
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#404040] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">Previous</p>
      </div>
    </div>
  );
}

function Pagination() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination">
      <Button5 />
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[8px] relative rounded-[8px] shrink-0 w-[34px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">1</p>
      </div>
    </div>
  );
}

function PaginationButton() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Button">
      <Button6 />
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[8px] relative rounded-[8px] shrink-0 w-[34px]" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#404040] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">2</p>
      </div>
    </div>
  );
}

function PaginationButton1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Button">
      <Button7 />
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[8px] relative rounded-[8px] shrink-0 w-[34px]" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#404040] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">3</p>
      </div>
    </div>
  );
}

function PaginationButton2() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Button">
      <Button8 />
    </div>
  );
}

function Button9() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[8px] relative rounded-[8px] shrink-0 w-[34px]" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#404040] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">4</p>
      </div>
    </div>
  );
}

function PaginationButton3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Button">
      <Button9 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <g id="Vector">
            <path d={svgPaths.pff644c0} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p26997e00} fill="var(--fill-0, #0A0A0A)" />
            <path d={svgPaths.p11a24000} fill="var(--fill-0, #0A0A0A)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function IconButton() {
  return (
    <div className="content-stretch flex items-center justify-center min-h-[36px] min-w-[36px] overflow-clip p-[8px] relative rounded-[8px] shrink-0" data-name="Icon Button">
      <Icon7 />
    </div>
  );
}

function PaginationEllipsis() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Ellipsis">
      <IconButton />
    </div>
  );
}

function Button10() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[8px] relative rounded-[8px] shrink-0 w-[34px]" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#404040] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">10</p>
      </div>
    </div>
  );
}

function PaginationButton4() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination Button">
      <Button10 />
    </div>
  );
}

function Button11() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button">
      <div className="css-g0mm18 flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#404040] text-[14px] text-center">
        <p className="css-ew64yg leading-[20px]">Next</p>
      </div>
    </div>
  );
}

function Pagination1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Pagination">
      <Button11 />
    </div>
  );
}

function Pagination2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Pagination">
      <Pagination />
      <PaginationButton />
      <PaginationButton1 />
      <PaginationButton2 />
      <PaginationButton3 />
      <PaginationEllipsis />
      <PaginationButton4 />
      <Pagination1 />
    </div>
  );
}

function Al7() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="AL">
      <p className="css-ew64yg font-['Geist:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#737373] text-[14px]">Showing 1-10 of 100 products</p>
      <Pagination2 />
    </div>
  );
}

export default function Card() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[8px] items-start p-[16px] relative rounded-[9px] size-full" data-name="Card">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-[-1px] pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <Al2 />
      <Table />
      <Al7 />
    </div>
  );
}