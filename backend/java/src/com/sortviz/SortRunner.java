package com.sortviz;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Reads JSON from stdin: {"category":"...","algorithm":"...","array":[...],"target":N}
 * Writes JSON to stdout:  {"javaMs":N,"steps":[...]}
 *
 * Hand-rolled JSON to avoid any external dependencies (no Gson required).
 */
public class SortRunner {
    public static void main(String[] args) throws Exception {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(System.in))) {
            String line; while ((line = br.readLine()) != null) sb.append(line);
        }
        String input = sb.toString();
        String category = extractString(input, "category");
        String algorithm = extractString(input, "algorithm");
        int[] array = extractIntArray(input, "array");
        Integer target = extractInteger(input, "target");

        long t0 = System.nanoTime();
        List<String> steps = new ArrayList<>();
        if ("sorting".equals(category) && "merge".equals(algorithm))      MergeSort.run(array, steps);
        else if ("sorting".equals(category) && "quick".equals(algorithm)) QuickSort.run(array, steps);
        else if ("sorting".equals(category) && "bubble".equals(algorithm)) BubbleSort.run(array, steps);
        else if ("searching".equals(category) && "linear".equals(algorithm)) LinearSearch.run(array, target, steps);
        else if ("searching".equals(category) && "binary".equals(algorithm)) BinarySearch.run(array, target, steps);
        else if ("searching".equals(category) && "jump".equals(algorithm)) JumpSearch.run(array, target, steps);
        else throw new IllegalArgumentException("Unknown algorithm: " + category + "/" + algorithm);
        long ms = (System.nanoTime() - t0) / 1_000_000;

        StringBuilder out = new StringBuilder();
        out.append("{\"javaMs\":").append(ms).append(",\"steps\":[");
        for (int i = 0; i < steps.size(); i++) { if (i > 0) out.append(","); out.append(steps.get(i)); }
        out.append("]}");
        System.out.println(out);
    }

    // --- tiny JSON helpers (good enough for the controlled input) ---
    static String extractString(String s, String key) {
        int k = s.indexOf("\"" + key + "\""); if (k < 0) return null;
        int c = s.indexOf(':', k); int q1 = s.indexOf('"', c + 1);
        if (q1 < 0) return null;
        int q2 = s.indexOf('"', q1 + 1);
        return s.substring(q1 + 1, q2);
    }
    static int[] extractIntArray(String s, String key) {
        int k = s.indexOf("\"" + key + "\""); if (k < 0) return new int[0];
        int lb = s.indexOf('[', k); int rb = s.indexOf(']', lb);
        String body = s.substring(lb + 1, rb).trim();
        if (body.isEmpty()) return new int[0];
        String[] parts = body.split(",");
        int[] out = new int[parts.length];
        for (int i = 0; i < parts.length; i++) out[i] = Integer.parseInt(parts[i].trim());
        return out;
    }
    static Integer extractInteger(String s, String key) {
        int k = s.indexOf("\"" + key + "\""); if (k < 0) return null;
        int c = s.indexOf(':', k);
        int e = c + 1;
        while (e < s.length() && (s.charAt(e) == ' ')) e++;
        int start = e;
        while (e < s.length() && "-0123456789".indexOf(s.charAt(e)) >= 0) e++;
        if (start == e) return null;
        return Integer.parseInt(s.substring(start, e));
    }

    // --- frame builders shared by algorithms ---
    static String frame(String label, int[] values, int[][] marks, boolean active, boolean merged) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"type\":\"frame\",\"rows\":[{");
        sb.append("\"label\":\"").append(label == null ? "" : label).append("\",");
        sb.append("\"active\":").append(active).append(",");
        sb.append("\"merged\":").append(merged).append(",");
        sb.append("\"values\":").append(Arrays.toString(values).replace(" ", "")).append(",");
        sb.append("\"marks\":[");
        for (int i = 0; i < marks.length; i++) {
            if (i > 0) sb.append(",");
            int idx = marks[i][0];
            String cls = clsName(marks[i][1]);
            sb.append("{\"i\":").append(idx).append(",\"cls\":\"").append(cls).append("\"}");
        }
        sb.append("]}]}");
        return sb.toString();
    }
    static String clsName(int code) {
        switch (code) {
            case 1: return "compare";
            case 2: return "swap";
            case 3: return "pivot";
            case 4: return "found";
            case 5: return "in-range";
            case 6: return "sorted";
            case 7: return "dim";
            default: return "";
        }
    }
}
