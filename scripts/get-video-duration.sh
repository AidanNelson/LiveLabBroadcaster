# Check if an input filename is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <input_filename>"
    exit 1
fi

# Input filename provided as the first argument
input_filename="$1"

duration=$(ffmpeg -i $input_filename 2>&1 | grep "Duration" | awk '{print $2}' | tr -d ,)
IFS=':' read -r -a array <<< "$duration"

# Extract hours, minutes, seconds, and milliseconds
hours=${array[0]}
minutes=${array[1]}
seconds=$(echo ${array[2]} | cut -d'.' -f1)
milliseconds=$(echo ${array[2]} | cut -d'.' -f2)

# Convert to milliseconds
totalMilliseconds=$(( (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds ))

echo "Duration in milliseconds: $totalMilliseconds"