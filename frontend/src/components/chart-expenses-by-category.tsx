import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, Bar, BarChart, Line, ComposedChart, Treemap } from "recharts"


export const ChartByCategory = ({ data, title, subtitle, color }) => {
  if (data.length === 0) {
    return null;
  }
  console.warn(data, title, subtitle);
  const sortData = data.sort((a, b) => b.size - a.size);

  const colorPallette = (value) => {
    if (value === 'positive') {
      return ['#22C55E', '#FAFAF9', 'green'];
    } else if (color === 'negative') {
      return ['#DC2626', '#FAFAF9', 'red'];
    }
  };
  const colorsList = colorPallette(color);

  const getGradientColor = function (start_color, end_color, percent) {
    // strip the leading # if it's there
    start_color = start_color.replace(/^\s*#|\s*$/g, '');
    end_color = end_color.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (start_color.length == 3) {
      start_color = start_color.replace(/(.)/g, '$1$1');
    }

    if (end_color.length == 3) {
      end_color = end_color.replace(/(.)/g, '$1$1');
    }

    // get colors
    var start_red = parseInt(start_color.substr(0, 2), 16),
      start_green = parseInt(start_color.substr(2, 2), 16),
      start_blue = parseInt(start_color.substr(4, 2), 16);

    var end_red = parseInt(end_color.substr(0, 2), 16),
      end_green = parseInt(end_color.substr(2, 2), 16),
      end_blue = parseInt(end_color.substr(4, 2), 16);

    // calculate new color
    var diff_red = end_red - start_red;
    var diff_green = end_green - start_green;
    var diff_blue = end_blue - start_blue;

    diff_red = ((diff_red * percent) + start_red).toString(16).split('.')[0];
    diff_green = ((diff_green * percent) + start_green).toString(16).split('.')[0];
    diff_blue = ((diff_blue * percent) + start_blue).toString(16).split('.')[0];

    // ensure 2 digits by color
    if (diff_red.length == 1) diff_red = '0' + diff_red
    if (diff_green.length == 1) diff_green = '0' + diff_green
    if (diff_blue.length == 1) diff_blue = '0' + diff_blue

    return '#' + diff_red + diff_green + diff_blue;
  };
  // console.log(getGradientColor('#16A34A', '#FAFAF9', 0.1));


  return (
    <>
      <Card className="w-[800px]">
        <CardHeader className="flex flex-row space-y-0 ">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{subtitle}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%" className='rounded-sm'>
              <Treemap width={400} height={200} data={sortData} dataKey="size" aspectRatio={4 / 3}
                content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
                  // console.log(root, depth, x, y, width, height, index, payload, colors, rank, name, root.children[index].value);
                  console.log(colorsList)
                  return (
                    <g>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={getGradientColor(colorsList[0], colorsList[1], data.length <= 1 ? 0 : ((1 / (data.length - 1)) * index))}
                        stroke={colorsList[2]}
                      />
                      {
                        depth === 1 ?
                          <>
                            <text
                              x={x + width / 2}
                              y={y + height / 2}
                              textAnchor="middle"
                              // fontSize={14}
                              className="text-[0.50rem] uppercase text-muted-foreground"
                            >
                              {name}
                            </text>
                            <text
                              x={x + width / 2}
                              y={y + height / 2 + 14}
                              textAnchor="middle"
                              // fontSize={12}
                              className="text-[0.70rem] uppercase text-muted-foreground font-bold"
                            >
                              {root.children[index].value}
                            </text>
                          </>
                          : null
                      }
                    </g>
                  );
                }}
              >
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload[0]) {
                      const { name, value } = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">{name}</span><p className="font-bold">{value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </CardContent >
      </Card >
    </>
  )
}